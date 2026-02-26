<?php
namespace App\Traits;

use App\Models\Commission;
use App\Models\UsersPaymentAddress;

trait Fireblock 
{
	//private $fireApiKey = 'b0395bfe-3376-4148-af8a-537ad4b3c815';
    private $fireApiKey = 'a6a4941b-7dd4-43c2-8df7-bf0169b3ded5';
	private $firebaseUrl = 'https://api.fireblocks.io';
	private $fireVaultAccountId = 884;

	public function fCrul($params)
    {   
        $ch = curl_init();        
        curl_setopt($ch, CURLOPT_URL, "http://127.0.0.1:8545");
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
        curl_setopt($ch, CURLOPT_POST, 1);
        curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, false);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($params));
        $headers = array();
        $headers[] = "Content-Type : application/json";
        curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
        $result = curl_exec($ch);
        if (curl_errno($ch)) {
            echo 'Error:' . curl_error($ch);
        }
        curl_close($ch);
        return json_decode($result);
    }

    public function fireGerenateVault($name,$customerRefId){
    	$params = array(
            "apiKey"         => $this->fireApiKey,
            "baseUrl"        => $this->firebaseUrl,
            "method"         => "createVault",
            "name"           => $name,
            "hiddenOnUI"     => false,
            "customerRefId"  => $customerRefId,
            "autoFuel"       => true
        );
        //dd($params);
        $data =  $this->fCrul($params);
        if(isset($data->status) && $data->status){
            return $data->result;
        }else{
            return false;
        }
    }

    public function createVaultAsset($vault,$asset){
        $params = array(
            "apiKey"         => $this->fireApiKey,
            "baseUrl"        => $this->firebaseUrl,
            "vaultAccountId" => $vault,
            "method"         => "createVaultAsset",
            "assetId"        => $asset
        );
        $data =  $this->fCrul($params);
        if(isset($data->status) && $data->status){
            return $data->result;
        }else{
            return false;
        }
    }

    public function fireblockdepositAddresses($vault,$asset){
        $params = array(
            "apiKey"         => $this->fireApiKey,
            "baseUrl"        => $this->firebaseUrl,
            "vaultAccountId" => $vault,
            "method"         => "depositAddresses",
            "assetId"        => $asset
        );
        $data =  $this->fCrul($params);
        if(isset($data->status) && $data->status){
            return $data->result;
        }else{
            return false;
        }
    }

    public function addressGerenateVault($vault,$asset,$customerRefId,$description){
        $params = array(
            "apiKey"         => $this->fireApiKey,
            "baseUrl"        => $this->firebaseUrl,
            "vaultAccountId" => $vault,
            "method"         => "generateAddress",
            "assetId"        => $asset,
            "description"    => $description,
            "customerRefId"  => $customerRefId
        );
        //dd($params);
        $data =  $this->fCrul($params);
        if(isset($data->status) && $data->status){
            return $data->result;
        }else{
            return false;
        }
    }

    public function getFirblockTransactions($params){
        $params = array(
            "apiKey"         => $this->fireApiKey,
            "baseUrl"        => $this->firebaseUrl,
            "method"         => "getTransactions",
            "params"        => $params
        );
        //dd($params);
        $data =  $this->fCrul($params);
        if(isset($data->status) && $data->status){
            return $data->result;
        }else{
            return false;
        }
    }
    public function craeteFirblockPaymentAddress($token,$coin_type,$invoice_id,$secret,$customerRefId)
    {
        $valut = $this->fireGerenateVault($invoice_id,$customerRefId);
        if($valut){
            $valutID = $valut->id;
            //CreateMercantVault::($uid,$vid,$asset_id,$address);
            $v_address = $this->createVaultAsset($valutID,$token);
            if($v_address){
                $address = $v_address->address;
                $ethtable = new UsersPaymentAddress;
                $ethtable->coin = $token;
                $ethtable->coin_type = $coin_type;
                $ethtable->o_txid = $invoice_id;
                $ethtable->address = $address;
                $ethtable->narcanru = $valutID;
                $ethtable->balance = 0.00000000;
                $ethtable->secret = $secret;
                $ethtable->save();

                return $address;
            }
        }        
        return false;           
    }
}