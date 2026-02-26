<?php
namespace App\Traits;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\DB;
use codenixsv\Bittrex\BittrexManager;


trait TradeData
{
    //Bitterex Liquidity
  public function bittrexlogin(){
    $manager = new BittrexManager('', '');
    $client = $manager->createClient();
    return $client;
  }

 
  public function getBalance(){
    $client = $this->bittrexlogin();
    $responce = json_decode($client->getBalances());                           
    return $responce;
  }
}