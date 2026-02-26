<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Traits\Fireblock;
use App\Models\LivePrice;
use App\Models\Commission;

class HomeController extends Controller
{
    use Fireblock;
    /**
     * Create a new controller instance.
     *
     * @return void
     */
    public function __construct()
    {
        //$this->middleware('auth');
    }

    /**
     * Show the application dashboard.
     *
     * @return \Illuminate\Contracts\Support\Renderable
     */
    public function index()
    {
        return redirect('/profile');
    }

    public function allSupportedCoins()
    {
        $comDetails = Commission::where('status',1)->get();
        return view('outerpage.allsupportedcoins',['coinslists' => $comDetails]);
    }

    public function testFirblock(){
        $asset = 'BTC_TEST';
        $customerRefId = 'Test12';
        $description ="Test Wallet";
        $data = $this->addressGerenateVault($asset,$customerRefId,$description);
        dd($data);
    }
	public function Helpcenter(){
        return view('helpcenter');
    }
    public function coinmarketcapAPiLiveprice(){
        $dataCoin = $this->coinmarketcapCrul();
        if(isset($dataCoin['data'])){
            $datas = $dataCoin['data'];
            foreach ($datas as $key => $data) {
                $symbol = $data['symbol'];
                $quotes = $data['quote'];
                $is_exits = Commission::where('source',$symbol)->exists();
                if($is_exits){
                    $usd = 0;
                    $eur = 0;
                    foreach ($quotes as $key => $quote) { 
                        if($key == 'USD'){
                            $usd = $quote['price'];
                            $up1 = LivePrice::UpdatePrice($symbol,'USD',$usd);
                        }else if($key == 'EUR'){
                            $eur = $quote['price'];
                            $up2 = LivePrice::UpdatePrice($symbol,'EUR',$eur);                        
                        }
                        $volume_24h = $quote['volume_24h'];                        
                        $volume_change_24h = $quote['volume_change_24h'];                        
                        $percent_change_1h = $quote['percent_change_1h'];                        
                        $percent_change_24h = $quote['percent_change_24h'];                        
                        $market_cap = $quote['market_cap'];                        
                        $market_cap_dominance = $quote['market_cap_dominance'];                        
                        $fully_diluted_market_cap = $quote['fully_diluted_market_cap'];                        
                    }
                    $update = array(
                        'usd_price'             => $usd,
                        'eur_price'             => $eur,
                        'volume_24h'            => $volume_24h,
                        'volume_change_24h'     => $volume_change_24h,
                        'percent_change_1h'     => $percent_change_1h,
                        'percent_change_24h'    => $percent_change_24h,
                        'market_cap'            => $market_cap,
                        'market_cap_dominance'  => $market_cap_dominance,
                        'fully_diluted_market_cap' => $fully_diluted_market_cap,
                    );
                    Commission::where('source',$symbol)->update($update);                    
                }
            }            
        }else{
            dd($dataCoin);
        }
    }
    public function coinmarketcapCrul(){
        $curl = curl_init();

        curl_setopt_array($curl, array(
          CURLOPT_URL => 'https://pro-api.coinmarketcap.com/v1/cryptocurrency/listings/latest?convert=EUR,USD',
          CURLOPT_RETURNTRANSFER => true,
          CURLOPT_ENCODING => '',
          CURLOPT_MAXREDIRS => 10,
          CURLOPT_TIMEOUT => 0,
          CURLOPT_FOLLOWLOCATION => true,
          CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
          CURLOPT_CUSTOMREQUEST => 'GET',
          CURLOPT_HTTPHEADER => array(
            'X-CMC_PRO_API_KEY: 19749ee8-527c-4add-8596-97e66d92f810'
          ),
        ));

        $response = curl_exec($curl);

        curl_close($curl);
        return json_decode($response, true);
    }
}
