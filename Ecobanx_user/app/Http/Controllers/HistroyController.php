<?php
namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Auth;
use App\User;
use App\Models\Transaction;
use App\Models\Deposit;
use App\Models\Commission;
use App\Models\UsersWithdraw;
use App\Models\OrderTransaction;
use App\Models\CurrencyWithdraw;
use App\Models\OverallTransaction;

class HistroyController extends Controller
{
  public function __construct()
  {
    //$this->middleware(['auth','twofa']);
    $this->middleware(['auth','twofa','kyc']);
  }

  public function TransactionHistroy()
  {
    $uid = Auth::user()->id;
    $history = OrderTransaction::where('uid',$uid)->paginate(10);   
    return view('userpanel.histroy.transaction_histroy',['history' => $history]);
  }

  public function UserTransactionView($id)
  { 
    $id =\Hashids::decode($id);
    $history = OrderTransaction::where('id',$id)->first();
    $uid = Auth::id();
    $user = User::where('id',$uid)->first();
    return view('userpanel.histroy.transaction_view',['trans' => $history,'user' => $user]);
  }

  public function WithdrawHistroy($coin=Null) {
    if($coin==Null){
      $lists = Commission::where('status',1)->first();
      $coin = $lists->source;
    }else{
      $coin = $coin;
    }
    $uid = Auth::user()->id;      
    $lists = Commission::where('status',1)->get();
    $details = Commission::coindetails($coin);
    if($details){
      if($details->type == 'fiat'){
        $DepositList = CurrencyWithdraw::listView(Auth::id(),$coin);        
        return view('userpanel.histroy.currency_withdraw_histroy',['transactions' => $DepositList,'currency' => $coin,'lists' => $lists]);
      }else{
        $histroy = UsersWithdraw::where(['user_id' => $uid,'coin_name'=>$coin])->orderBy('created_at','desc')->paginate(20);
        return view('userpanel.histroy.withdraw_histroy',['datas' => $histroy,'lists' => $lists,'currency' => $coin]);
      }
    }else{
      return redirect('/wallet')->with('adminwalletbank','Invalid Coin/Currency');
    }
  }

  public function DepositHistroy($coin=Null){
    if($coin==Null){
      $lists = Commission::where('status',1)->first();
      $coin = $lists->source;
    }else{
      $coin = $coin;
    }
    $uid = Auth::user()->id;
    $lists = Commission::where('status',1)->get();

    $details = Commission::coindetails($coin);
    if($details){
      if($details->type == 'fiat'){
        $DepositList = Deposit::listView(Auth::id(),$coin);        
        return view('userpanel.histroy.currency_deposit_histroy',['transaction' => $DepositList,'coin' => $coin,'lists' => $lists]);
      }else{
        $histroy = Transaction::where(['uid' => $uid,'currency'=>$coin])->orderBy('created_at','desc')->paginate(20);
        return view('userpanel.histroy.deposit_histroy',['datas' => $histroy,'currency' => $coin,'lists' => $lists]);
      }
    }else{
      return redirect('/wallet')->with('adminwalletbank','Invalid Coin/Currency');
    }
  }

  public function overallhistroy()
  {
    $uid = Auth::user()->id;
    $history = OverallTransaction::where('uid',$uid)->paginate(10);   
    return view('userpanel.histroy.overall_histroy',['history' => $history]);
  }
}
