<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\SwapCoinPair;


class LivePriceUpdateSwap extends Command
{
    
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'update:Swapliveprice';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Update Live price for all Swap pair';

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
        $exchangeTicker = json_decode(crul("https://api.binance.com/api/v3/ticker/24hr"));
        if(isset($exchangeTicker)){
        if(count($exchangeTicker) > 0){
            foreach($exchangeTicker as $dataget ){
                $pairsymbol = $dataget->symbol;
                $trade =  SwapCoinPair::where('symbol',$pairsymbol)->first();
                if(is_object($trade)){
                    $trade->open = $dataget->openPrice;
                    $trade->high = $dataget->highPrice;
                    $trade->low = $dataget->lowPrice;
                    $trade->liveprice = $dataget->lastPrice;
                    $trade->hrchange  = display_format($dataget->priceChangePercent,2);
                    $trade->hrvolume  = $dataget->volume;
                    $trade->updated_at  = date('Y-m-d H:i:s',time());
                    $trade->save();
                }
            }
            $this->info('Swappair Price update successfully');
        } 
      }       
                       
    }
}
