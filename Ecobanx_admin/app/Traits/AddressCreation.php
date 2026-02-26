<?php 
namespace App\Traits;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\Auth;
use App\Models\User;
use App\Traits\BtcClass;
use App\Traits\EvmClass;
use App\Traits\LtcClass;
use App\Traits\TrcClass;
use App\Traits\XrpClass;

trait AddressCreation {
	use BtcClass,EvmClass,TrcClass,LtcClass,XrpClass;

	public function userAddressCreation($id)
	{		
		$ethAddress = $this->create_user_evm($id);
		$trxAddress = $this->createTrcAddress($id);
		$btcAddress = $this->create_user_btc($id);
		$ltcAddress = $this->create_user_ltc($id);
		$xrpAddress = $this->create_user_xrp($id);

		if(isset($ethAddress) && isset($btcAddress) && isset($trxAddress) && isset($ltcAddress) && isset($xrpAddress)){
			return 1;
		}
		else{
			return 0;
		}		
	}
}