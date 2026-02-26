<?php

use Illuminate\Http\Request;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| is assigned the "api" middleware group. Enjoy building your API!
|
*/

Route::middleware('auth:userapi')->get('/user', function (Request $request) {
    return $request->user();
});
Route::post('login', 'API\ApiController@login');

Route::group(['middleware' => 'auth:userapi'], function(){

	  Route::post('get_basic_info', 'API\ApiController@GetBasicInfo');
	  Route::post('balances', 'API\ApiController@WalletBalances');
	  Route::post('get_deposit_address', 'API\ApiController@GetDepositAddress');
	  Route::post('get_tx_info_multi', 'API\ApiController@GetTxInfoMulti');
	  Route::post('get_tx_info', 'API\ApiController@GetTxInfo');
	  Route::post('get_tx_ids', 'API\ApiController@GetTxIds');
	  Route::post('create_transfer', 'API\ApiController@CreateTransfer');
	  Route::post('convert', 'API\ApiController@Convert');
	  Route::post('get_withdrawal_history', 'API\ApiController@GetWithdrawalHistory');
	  Route::post('get_withdrawal_info', 'API\ApiController@GetWithdrawalInfo');
	  Route::post('create_transaction', 'API\ApiController@CreateTransaction');
});

Route::any('kycstatus', 'API\ApiController@sumSubKYC');