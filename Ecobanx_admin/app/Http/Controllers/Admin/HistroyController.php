<?php
namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Commission;
use App\Models\CurrencyDeposit;
use App\Models\CurrencyWithdraw;
use App\Models\OrderTransaction;
use App\Models\Transaction;
use App\Models\UsersWithdraw;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Crypt;

class HistroyController extends Controller
{

    public function __construct()
    {
        $this->middleware('admin');
    }

    public function DepositList(Request $request, $coin)
    {
        $details = Commission::coindetails($coin);
        if ($details) {
            if ($details->type == 'fiat') {
                $DepositList = CurrencyDeposit::depsoitList($coin);
                return view('userdeposit.fiat_deposit', ['deposit' => $DepositList, 'coin' => $coin]);
            } else {

                $searchphrase = $request->searchnames ?? "";

                $DepositList = Transaction::where('currency', $coin)
                ->join('users', 'transactions.uid', '=', 'users.id')
                ->when($searchphrase, function ($query) use ($searchphrase) {
                    $searchAl = $searchphrase;
                    $query->where(function($q) use ($searchAl) {
                        $q->where('users.name', 'LIKE', "%{$searchAl}%")
                        ->orWhere('users.email', 'LIKE', "%{$searchAl}%");
                    });
                })
                ->select('transactions.*', 'users.name', 'users.email')
                ->orderBy('id', 'desc')
                ->paginate(10)
                ->appends($request->all());


                return view('userdeposit.crypto_deposit', ['depositList' => $DepositList, 'coin' => $coin,'searchphrase' => $searchphrase]);
            }
        } else {
            return redirect('/')->with('error', 'Invalid Coin/Currency');
        }
    }

    public function CryptoDepositEdit($id)
    {
        $transfer_id = Crypt::decrypt($id);
        $btcDeposit  = Transaction::depsoitView($transfer_id);
        return view('userdeposit.crypto_deposit_edit')->with('deposit', $btcDeposit);
    }

    public function CryptoDepositUpdate(Request $request)
    {
        $Deposit = Transaction::depsoitUpdate($request);
        if ($Deposit) {
            return back()->with('status', 'Deposit Updated Successfully');
        } else {
            return back()->with('status', 'Deposit Updated Failed');
        }
    }

    public function FiatDepositList()
    {
        $usdDepositList = CurrencyDeposit::depsoitList('USD');
        return view('userdeposit.usd_deposit')->with(['deposit' => $usdDepositList]);
    }

    public function FiatDepositEdit($id)
    {
        $depositList = CurrencyDeposit::edit(Crypt::decrypt($id));
        return view('userdeposit.deposit_edit')->with(['deposit' => $depositList]);
    }

    public function FiatDepositUpdate(Request $request)
    {
        $depositUpdate = CurrencyDeposit::statusUpdate($request);
        return back()->with('success', 'Deposit Updated Successfully');
    }

    public function WithdrawList(Request $request, $coin, $search = null)
    {


        try {


                $searchAl = $request->searchnames ?? "";
                $details = Commission::coindetails($coin);
                if ($details) {
                    if ($details->type == 'fiat') {
                        $crypto_trasnaction = CurrencyWithdraw::histroy($details->source);
                        return view('userwithdraw.fiat_withdraw', ['currency' => $coin, 'transaction' => $crypto_trasnaction]);
                    } else {
                        $btcWithdraw = UsersWithdraw::where('coin_name', $coin)
                            ->join('users', 'users_withdraws.user_id', '=', 'users.id')
                            ->when($searchAl, function ($query) use ($searchAl) {
                                $query->where(function($q) use ($searchAl) {

                                    $q->where('users.name', 'LIKE', "%{$searchAl}%")
                                    ->orWhere('users.email', 'LIKE', "%{$searchAl}%");
                                });
                            })
                            ->select('users_withdraws.*', 'users.name', 'users.email')
                            ->orderBy('users_withdraws.created_at', 'desc')
                            ->paginate(5)->appends($request->all());

                        return view('userwithdraw.crypto_withdraw', ['currency' => $coin, 'transaction' => $btcWithdraw,'searchphrase' => $searchAl]);
                    }
                } else {
                    return redirect('/')->with('error', 'Invalid Coin/Currency');
                }

        } catch (\Exception $e) {
            dd($e->getMessage());
        }

    }

    public function withdrawFiatEdit($id)
    {
        $crypto_trasnaction = CurrencyWithdraw::edit(Crypt::decrypt($id));
        return view('userwithdraw.withdraw_edit', ['withdraw' => $crypto_trasnaction]);
    }

    public function withdrawFiatUpdate(Request $request)
    {
        $crypto_trasnaction = CurrencyWithdraw::withdrawUpdate($request);
        return back()->with('status', 'Withdraw Updated Successfully');
    }

    public function WithdrawCryptoEdit($id)
    {
        $withdraw = UsersWithdraw::edit($id);
        return view('userwithdraw.cryptowithdraw_edit', [
            'withdraw' => $withdraw,
        ]);
    }

    public function updateCryptoWithdraw(Request $request)
    {
        $withdraw = UsersWithdraw::withdrawUpdate($request);
        return back()->with('status', 'Withdraw Updated Successfully');
    }

    public function PaymentTransaction(Request $request)
    {

        $coinlists = Commission::get();
        $coin      = $request->query('coin');
        $coin1     = $request->query('coin1');
        $status    = $request->query('status');

        if (isset($coin) && $coin != '' && $coin != 'all') {
            $histroy = OrderTransaction::on('mysql2')->where('currency1', $coin)->orderBy('id', 'desc')->get();
        } else if (isset($coin1) && $coin1 != '' && $coin1 != 'all') {
            $histroy = OrderTransaction::on('mysql2')->where('currency2', $coin1)->orderBy('id', 'desc')->get();
        } else if (isset($status) && $status != '' && $status != 'all') {
            $histroy = OrderTransaction::on('mysql2')->where('status', $status)->orderBy('id', 'desc')->get();
        } else {
            $histroy = OrderTransaction::histroy();
        }
        return view('payments.merchant-payment-list', ['histroys' => $histroy, 'coinlists' => $coinlists]);
    }

    public function PaymentViewTransaction($id)
    {
        $id      = Crypt::decrypt($id);
        $histroy = OrderTransaction::viewDetails($id);
        if ($histroy) {
            return view('payments.merchant-payment-view', ['histroys' => $histroy]);
        } else {
            return back()->with('status', 'Invalid Data please check');
        }
    }

}
