<?php

namespace App\Http\Controllers\Admin;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Crypt;
use App\Models\UserBtcTransaction;
use App\Models\UserEthTransaction;
use App\Models\UserXrpTransaction;
use App\Models\UserEthDeposit;
use App\Models\CurrencyDeposit;
use App\Models\AdminBtcDeposit;
use App\Models\AdminEthDeposit;

class DepositController extends Controller {

    public function __construct() {
        $this->middleware('admin');
    }

    public function btcDepositList() {
        $btcDepositList = UserBtcTransaction::depsoitList();
        return view('userdeposit.btc_deposit')->with('depositList',$btcDepositList);
    }

    public function btcDepositEdit($id) {
        $transfer_id = Crypt::decrypt($id);
        $btcDeposit = UserBtcTransaction::depsoitView($transfer_id);
        return view('userdeposit.btc_deposit_edit')->with('deposit',$btcDeposit);
    }

    public function btcDepositUpdate(Request $request) {
        $btcDeposit = UserBtcTransaction::depsoitUpdate($request);
        if($btcDeposit) {
            return back()->with('status','Deposit Updated Successfully');
        } else {
            return back()->with('status','Deposit Updated Failed');
        }
    }

    public function ethDepositList() {
        $ethDepositList = UserEthTransaction::depsoitList();
        return view('userdeposit.eth_deposit')->with(['depositList'=> $ethDepositList,'url' => 'https://etherscan.io/tx/']);
    }

    public function ethDepositEdit($id) {
        $transfer_id = Crypt::decrypt($id);
        $btcDeposit = UserEthTransaction::depsoitView($transfer_id);
        return view('userdeposit.eth_deposit_edit')->with('deposit',$btcDeposit);
    }

    public function ethDepositUpdate(Request $request) {
        $btcDeposit = UserEthTransaction::depsoitUpdate($request);
        if($btcDeposit) {
            return back()->with('status','Deposit Updated Successfully');
        } else {
            return back()->with('status','Deposit Updated Failed');
        }
    }

    public function xrpDepositList() {
        $ethDepositList = UserXrpTransaction::depsoitList();
        return view('userdeposit.xrp_deposit')->with(['depositList'=> $ethDepositList,'url' => 'https://etherscan.io/tx/']);
    }

    public function xrpDepositEdit($id) {
        $transfer_id = Crypt::decrypt($id);
        $btcDeposit = UserXrpTransaction::depsoitView($transfer_id);
        return view('userdeposit.xrp_deposit_edit')->with('deposit',$btcDeposit);
    }

    public function xrpDepositUpdate(Request $request) {
        $btcDeposit = UserXrpTransaction::depsoitUpdate($request);
        return back()->with('status','Deposit Updated Successfully');
    }

    public function usdDepositList() {
        $usdDepositList = CurrencyDeposit::depsoitList('USD');
        return view('userdeposit.usd_deposit')->with(['deposit'=> $usdDepositList]);
    } 

    public function depositEdit($id) {
        $depositList = CurrencyDeposit::edit(Crypt::decrypt($id));
        return view('userdeposit.deposit_edit')->with(['deposit'=> $depositList]);
    }

    public function depositUpdate(Request $request) {
        $depositUpdate = CurrencyDeposit::statusUpdate($request);
        return back()->with('status','Deposit Updated Successfully');
    }

    public function tryDepositList() {
        $tryDepositList = CurrencyDeposit::depsoitList('TRY');
        return view('userdeposit.try_deposit')->with(['deposit'=> $tryDepositList]);
    }

    public function eruDepositList() {
        $eruDepositList = CurrencyDeposit::depsoitList('EUR');
        return view('userdeposit.eru_deposit')->with(['deposit'=> $eruDepositList]);
    }

}