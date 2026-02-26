<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\LivePrice;
use App\Models\Commission;

class UpdateLivePrice extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'update:liveprice';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Update Live price BTC';

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
        $coins = Commission::where('status',1)->get();
        foreach($coins as $data) {
            if($data->source == 'EURST'){
                $this->europenBankAPI();
            }else if($data->source == 'WFI'){
                $url = "https://wfi.exchange/api/v1/market/price/wfi_USDT";
                $result = $this->cUrlss($url);                
                if(isset($result['data']['price'])){
                    $usd = $result['data']['price'];
                    $up1 = LivePrice::UpdatePrice($data->source,'USD',$usd);
                    Commission::where('id',$data->id)->update(['usd_price' => $usd]);
                }                
            }else{
                $url = 'https://min-api.cryptocompare.com/data/price?fsym='.$data->source.'&tsyms=USD,EUR,INR';
                $result = $this->cUrlss($url);
                $eur = 0;
                $usd = 0;
                if(isset($result['EUR'])){
                    $eur = $result['EUR'];
                    $up2 = LivePrice::UpdatePrice($data->source,'EUR',$eur);
                }
                if(isset($result['USD'])){
                    $usd = $result['USD'];
                    $up1 = LivePrice::UpdatePrice($data->source,'USD',$usd);
                }
                Commission::where('id',$data->id)->update(['usd_price' => $usd,'eur_price' => $eur]);
            }
       }

    }
    public function europenBankAPI(){
        $datagets = array();
        $sXML = $this->download_page('http://www.ecb.europa.eu/stats/eurofxref/eurofxref-daily.xml');
        $XMLContent = simplexml_load_string($sXML);
        $json = json_encode($XMLContent);
        $array = json_decode($json,TRUE);  
        $loopdata = $array['Cube']['Cube']['Cube'];
        foreach($loopdata as $line){
            if($line['@attributes']['currency'] == 'USD'){
                $priceval = $line['@attributes']['rate'];
                $usd = ncDiv(1,$priceval);
                Commission::where('source','EURST')->update(['usd_price' => $usd,'eur_price' => 1]);
                LivePrice::UpdatePrice('EURST','USD',$usd);
            }
        }
    }
    function download_page($path){
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL,$path);
        curl_setopt($ch, CURLOPT_FAILONERROR,1);
        curl_setopt($ch, CURLOPT_FOLLOWLOCATION,1);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER,1);
        curl_setopt($ch, CURLOPT_TIMEOUT, 15);
        $retValue = curl_exec($ch);          
        curl_close($ch);
        return $retValue;
    }
    public function cUrlss($url){
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);

        $result = curl_exec($ch);
        if (curl_errno($ch)) {
            echo 'Error:' . curl_error($ch);
        }
        curl_close ($ch);
        return json_decode($result, true);
    }
}
