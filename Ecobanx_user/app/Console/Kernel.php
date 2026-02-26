<?php

namespace App\Console;

use Illuminate\Console\Scheduling\Schedule;
use Illuminate\Foundation\Console\Kernel as ConsoleKernel;

class Kernel extends ConsoleKernel
{
    /**
     * The Artisan commands provided by your application.
     *
     * @var array
     */
    protected $commands = [
        Commands\OrderCancel::class,
        Commands\UpdateLivePrice::class,
        Commands\WFIUpdate::class,
    ];

    /**
     * Define the application's command schedule.
     *
     * @param  \Illuminate\Console\Scheduling\Schedule  $schedule
     * @return void
     */
    protected function schedule(Schedule $schedule)
    {
        $schedule->command('update:order')->everyTenMinutes()->withoutOverlapping();
        $schedule->command('update:liveprice')->everyTenMinutes()->withoutOverlapping();
        //$schedule->command('update:wfi')->everyMinute()->withoutOverlapping();
        $schedule->command('update:evmtoken')->everyFiveMinutes()->withoutOverlapping();
    }

    /**
     * Register the commands for the application.
     *
     * @return void
     */
    protected function commands()
    {
        $this->load(__DIR__.'/Commands');

        require base_path('routes/console.php');
    }
}
