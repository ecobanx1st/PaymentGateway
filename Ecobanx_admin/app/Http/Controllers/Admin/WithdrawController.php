<?php

namespace App\Http\Controllers\Admin;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Crypt;
use App\Models\UserBtcTransaction;
use App\Models\UserEthTransaction;
use App\Models\UserXrpTransaction;
use App\Models\CurrencyWithdraw;

class WithdrawController extends Controller
{
    public function __construct()
    {
        $this->middleware('admin');
    }
    
    public function btcWithdrawList()
    {
    	$btcWithdraw = UserBtcTransaction::withdraw();

        return view('userwithdraw.btc_withdraw', ['currency' => 'BTC', 'transaction' => $btcWithdraw]);
    }

    public function btcWithdrawEdit($id)
    {
         $withdraw = UserBtcTransaction::withdrawEdit($id);
        
        return view('userwithdraw.btcwithdraw_edit',[
            'withdraw' => $withdraw
        ]);
    }

    public function updateBtcWithdraw(Request $request)
    {
        $withdraw = UserBtcTransaction::withdrawUpdate($request);

        return back()->with('status',$withdraw);

    }

    public function ethWithdrawList()
    {
    	$ethWithdraw = UserEthTransaction::histroy();
        
        return view('userwithdraw.eth_withdraw', ['currency' => 'ETH', 'transaction' => $ethWithdraw]);
    }


    public function ethWithdrawEdit($id)
    {
         $withdraw = UserEthTransaction::withdrawEdit($id);
        
        return view('userwithdraw.ethwithdraw_edit',[
            'withdraw' => $withdraw
        ]);
    }

    public function updateEthWithdraw(Request $request)
    {
        $withdraw = UserEthTransaction::withdrawUpdate($request);

        return back()->with('status',$withdraw);

    }

    public function xrpWithdrawList()
    {
        $xrpWithdraw = UserXrpTransaction::withdraw();
        
        return view('userwithdraw.xrp_withdraw', ['currency' => 'ETH', 'transaction' => $xrpWithdraw]);
    }


    public function xrpWithdrawEdit($id)
    {
         $withdraw = UserXrpTransaction::withdrawEdit($id);
        
        return view('userwithdraw.xrpwithdraw_edit',[
            'withdraw' => $withdraw
        ]);
    }

    public function updateXrpWithdraw(Request $request)
    {
        $withdraw = UserXrpTransaction::withdrawUpdate($request);

        return back()->with('status',$withdraw);

    }

    public function usdWithdrawList()
    {
    	$crypto_trasnaction = CurrencyWithdraw::histroy('4');
        
        return view('userwithdraw.usd_withdraw', ['currency' => 'USD', 'transaction' => $crypto_trasnaction]); 
    } 

    public function tryWithdrawList()
    {
    	$crypto_trasnaction = CurrencyWithdraw::histroy('5');
        
        return view('userwithdraw.try_withdraw', ['currency' => 'TRY', 'transaction' => $crypto_trasnaction]); 
    }

    public function eurWithdrawList()
    {
    	$crypto_trasnaction = CurrencyWithdraw::histroy('6');
        
        return view('userwithdraw.eur_withdraw', ['currency' => 'EUR', 'transaction' => $crypto_trasnaction]);
    }


    public function withdrawEdit($id)
    {
        $crypto_trasnaction = CurrencyWithdraw::edit(Crypt::decrypt($id));
        
        return view('userwithdraw.withdraw_edit', ['withdraw' => $crypto_trasnaction]); 
    }

    public function withdrawUpdate(Request $request)
    {

        $crypto_trasnaction = CurrencyWithdraw::withdrawUpdate($request);

        return back()->with('status','Withdraw Updated Successfully');
    }
}
