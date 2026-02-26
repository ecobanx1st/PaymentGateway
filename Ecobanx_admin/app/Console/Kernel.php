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
        Commands\CreateUserDetails::class,

		Commands\BalanceTRXUpdate::class,
        Commands\BalanceETHUpdate::class,
        Commands\BalanceBNBUpdate::class,
        Commands\BalanceBNBTokenUpdate::class,
        Commands\BalanceTokenUpdate::class,
        Commands\BalanceMATICUpdate::class,
        Commands\BalanceMATICTokenUpdate::class,
		Commands\BlockchainUpdate::class,        
        Commands\BalanceBTCUpdate::class,
        Commands\BalanceLTCUpdate::class,
        Commands\BalanceXRPUpdate::class,        
        Commands\BalanceUpdateEVMToken::class,		
       
        Commands\BNBColdWallet::class,
        Commands\MATICColdWallet::class,
        Commands\TRXColdWallet::class,
        Commands\TRXTokenColdWallet::class,
        Commands\TRXFeewalletMove::class,
        Commands\ETHColdWallet::class,
        Commands\BTCColdWallet::class,
        Commands\LTCColdWallet::class,

        Commands\WithdrawTRCUpdate::class,
        Commands\WithdrawTRXUpdate::class,
        Commands\WithdrawBNBTokenUpdate::class,
        Commands\WithdrawBNBUpdate::class,
        Commands\WithdrawETHTokenUpdate::class,
        Commands\WithdrawETHUpdate::class,
        Commands\WithdrawMATICUpdate::class,
        Commands\WithdrawMATICTokenUpdate::class,
		Commands\WithdrawWFIUpdate::class,

        Commands\LivepriceUpdateSwap::class,
        
    ];

    /**
     * Define the application's command schedule.
     *
     * @param  \Illuminate\Console\Scheduling\Schedule  $schedule
     * @return void
     */
    protected function schedule(Schedule $schedule)
    {
		$schedule->command('withdraw:wfi')->everyMinute()->withoutOverlapping();
		//$schedule->command('update:blockchain')->everyFiveMinutes()->withoutOverlapping();
    }

    /**
     * Register the Closure based commands for the application.
     *
     * @return void
     */
    protected function commands()
    {
        require base_path('routes/console.php');
    }
}
