<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\GasPrice;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\DB;
use App\Traits\TokenERCClass;

class GasFeeUpdate extends Command
{
    use TokenERCClass;
   /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'update:gasprice';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Update gas price';

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
        $get_gas_price = $this->getGasPrice();
        if(isset($get_gas_price->fast) && $get_gas_price->fast > 0)
        {
            $get_fee = $get_gas_price->fast;
            if($get_fee > 0)
            {
                $gasPrice = $get_fee."00000000";
            }
            $price = GasPrice::where('id',1)->first();

            $toaddress = '0xABF3d44F8e2598f45541dB55b84f425BdE813EDd';
            $nornamlfee = $price->ethgaslimit * $gasPrice;
            $ethfee = $this->weitoeth($nornamlfee);
            $tokfee = $price->tokengaslimit * $gasPrice;
            $tokenfee = $this->weitoeth($tokfee);
            $usdfee = $price->usdtgaslimit * $gasPrice;
            $usdtfee = $this->weitoeth($usdfee);
            
            $price->fee = $get_fee;
            $price->gasprice = $gasPrice;
            $price->ethfee = $ethfee;
            $price->usdtfee = $usdtfee;
            $price->tokenfee = $tokenfee;
            $price->updated_at = date('Y-m-d H:i:s',time());
            $price->save();

        }
        
        $this->info('Gas price updated successfully');
    }

    public function getGasPrice()
    {
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, "https://ethgasstation.info/api/ethgasAPI.json");
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, true);
        $result = curl_exec($ch);
        if (curl_errno($ch)) {
            echo 'Error:' . curl_error($ch);
        }
        curl_close($ch);
        $data = json_decode($result);
        return $data;
    }

    public function weitoeth($amount){
        return $amount / 1000000000000000000;
    }

}
