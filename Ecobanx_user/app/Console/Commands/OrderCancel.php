<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\OrderTransaction;


class OrderCancel extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'update:order';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Cancelled transaction for pending request';

    /**
     * Create a new command instance.
     *
     * @return void
     */
    public function __construct()
    {
        parent::__construct();
    }

    /**
     * Execute the console command.
     *
     * @return mixed
    */
    public function handle()
    {
        $date = new \DateTime();
        $date->modify('-5 hours');
        $formatted_date = $date->format('Y-m-d H:i:s');
        $gettrans =OrderTransaction::where([['created_at', '<',$formatted_date],['status', '=',0]])->get();
        if(count($gettrans)){
            foreach ($gettrans as $key => $value) {           
                $id = $value->id;
                $status = -1;
                $status_text = "Cancelled / Timed Out";
                $update = OrderTransaction::where('id',$id)->update(['status' => $status,'status_text' => $status_text]);
            }
            $this->info('Order transaction Cancelled to Pending Orders');
        }     
        
    }

  
}
