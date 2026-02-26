<?php

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| contains the "web" middleware group. Now create something great!
|
*/

Route::get('/', function () {
    return view('welcome');
});


Route::post('login','AdminLoginController@login');
Route::get('logout', 'AdminLoginController@logout');
Route::group([ 'middleware' => ['admin'], 'prefix'=>'admin', 'namespace' =>'Admin' ], function ()
{
	//google 2FA
	Route::get('/googe2faenable', 'TwofaController@enableGoogleTwoFactor')->name('googe2faenable');
	Route::post('/google_admin_verfiy', 'TwofaController@google_admin_verfiy')->name('google_admin_verfiy');

});

Route::group([ 'middleware' => ['admin','twofa'], 'prefix'=>'admin', 'namespace' =>'Admin' ], function ()
{

	Route::get('dashboard', 'DashboardController@index');

	//Users
	Route::get('users', 'UserController@index');
	Route::get('users_edit/{id}', 'UserController@edit');
	Route::get('deleteuser/{id}', 'UserController@userDestroy');
	Route::post('update_user', 'UserController@update');
	Route::get('userApi/{id}', 'UserController@userApi');
	Route::get('users_wallet/{id}', 'UserController@userWallet');
	Route::get('users/search', 'UserController@usersearch');

	Route::get('userdeposit/{id}', 'UserController@userdeposit');
	Route::get('users_address/{uid}/{coin}', 'UserController@users_address');
	Route::get('overalltransaction/{id}/{coin}', 'UserController@OverallTransaction');

	Route::get('userfiatdeposit/{id}', 'UserController@userfiatdeposit');
	Route::get('user_fiatdeposit_edit/{id}', 'UserController@user_fiatdeposit_edit');
	Route::post('user_fiatdeposit_update', 'UserController@user_fiatdeposit_update');
	Route::get('user_fiat_withdraw/{id}', 'UserController@user_fiat_withdraw');
	Route::get('fiat_withdraw_edit/{id}', 'UserController@fiat_withdraw_edit');
	Route::post('fiat_withdraw_update', 'UserController@fiat_withdraw_update');

	//User Commission Setting
	Route::get('usercommissionsetting/{id}', 'UserController@UserCommissionSetting');
	Route::get('createusercommission/{uid}', 'UserController@CreateUserCommission');
	Route::get('editusercommissionsettings/{id}', 'UserController@EditCommissionSettings');
	Route::post('usercommissionupdate', 'UserController@UserCommissionUpdate');

	//Account details
	Route::get('basic_profile/{id}', 'UserController@Profile');
	Route::get('merchant_details/{id}', 'UserController@MerchantDetails');

	Route::get('user_withdraw/{id}', 'UserController@UserWithdrawList');
	Route::get('user_crypto_withdraw_edit/{id}', 'UserController@WithdrawCryptoEdit');
	Route::post('user_update_cryptowithdraw', 'UserController@updateCryptoWithdraw');

	//Deposit
	Route::get('deposits/{coin}/{search?}', 'HistroyController@DepositList');
	Route::get('cryptodeposit/{id}', 'HistroyController@CryptoDepositEdit');
	Route::post('cryptodeposit_update', 'HistroyController@CryptoDepositUpdate');
	Route::get('fiatdeposit_edit/{id}', 'HistroyController@FiatDepositEdit');
	Route::post('fiatdeposit_update', 'HistroyController@FiatDepositUpdate');

	//Withdraw
	Route::get('withdraw/{coin}/{search?}', 'HistroyController@WithdrawList');
	Route::get('crypto_withdraw_edit/{id}', 'HistroyController@WithdrawCryptoEdit');
	Route::post('update_cryptowithdraw', 'HistroyController@updateCryptoWithdraw');
	Route::get('withdraw_edit/{id}', 'HistroyController@withdrawFiatEdit');
	Route::post('withdraw_update', 'HistroyController@withdrawFiatUpdate');


	//Commission
	Route::get('commission/{search?}', 'CommissionController@index');
	Route::get('commissionsettings/{id}', 'CommissionController@edit');
	Route::post('commissionupdate', 'CommissionController@commissionUpdate');

	//Token Setting
	Route::get('coinlist/{search?}','CommissionController@tokenlist');
	Route::get('addcoin', 'CommissionController@addcoin');
	Route::post('addcoininsert', 'CommissionController@addcoininsert');
	Route::get('coinsettings/{id}', 'CommissionController@tokenedit');
	Route::post('coinupdate', 'CommissionController@TokenUpdate');
	Route::get('deletedcoin/{id}', 'CommissionController@coinDelete');

	//Support
	Route::get('support/{search?}', 'SupportController@index');
	Route::get('reply/{id}', 'SupportController@reply');
	Route::post('tickets/adminsavechat', 'SupportController@adminsavechat');

	//Kyc
	Route::get('kyc/{search?}', 'KycController@index');
	Route::get('kycview/{id}', 'KycController@kycview');
	Route::post('kycupdate', 'KycController@kycadminUpdate');

	//Site Settings
	Route::get('logo', 'SettingsController@logo');
	Route::post('update_logo', 'SettingsController@updateLogo');

	Route::get('tc', 'SettingsController@tc');
	Route::post('update_terms', 'SettingsController@update_terms');

	Route::get('privacy', 'SettingsController@privacy');
	Route::post('update_privacy', 'SettingsController@updatePrivacy');

	Route::get('bannerview', 'SettingsController@bannerview');
	Route::post('homebanner', 'SettingsController@HomeBanner');
	Route::post('updatebanner', 'SettingsController@updatebanner');

	Route::get('aboutus', 'SettingsController@aboutus');
	Route::post('update_about', 'SettingsController@updateAbout');

	Route::get('accept_payment', 'SettingsController@accept_payment');
	Route::post('update_accept_payment', 'SettingsController@update_accept_payment');

	Route::get('homebanner/{id}', 'SettingsController@homedownbanner');
	Route::post('update_homebanner', 'SettingsController@update_homebanner');

	Route::get('features', 'SettingsController@features');
	Route::post('features_update', 'SettingsController@features_settings');

	Route::get('how', 'SettingsController@howwork');
	Route::post('work_update', 'SettingsController@work_update');

	Route::get('faq', 'SettingsController@faq');
	Route::get('/faq_add', 'SettingsController@faq_add');
	Route::post('/faq_save', 'SettingsController@faq_save');
	Route::get('/faq_edit/{id}', 'SettingsController@faq_edit');
	Route::get('/faq_delete/{id}', 'SettingsController@faq_destroy');
	Route::post('/faq_update', 'SettingsController@faq_update');

	Route::get('socialmedia', 'SettingsController@socialmedia');
	Route::post('save_social_media', 'SettingsController@saveSocialMedia');

	//Security
	Route::get('security', 'DashboardController@security');
	Route::post('changeusername', 'DashboardController@updateUsername');
	Route::post('changepassword', 'DashboardController@changepassword');

	Route::get('category/{search?}', 'NaijaapiController@index');
	Route::get('addcat', 'NaijaapiController@addforum');
	Route::post('addcategory', 'NaijaapiController@addcategory');
	Route::get('viewcategory/{id}', 'NaijaapiController@viewcategory');
	Route::post('updatecategory', 'NaijaapiController@updatecategory');
	Route::get('cat_delete/{id}', 'NaijaapiController@cat_rem');

	Route::get('subcategory/{search?}', 'NaijaapiController@subcategory');
	Route::get('subaddcat', 'NaijaapiController@subaddcat');
	Route::post('subaddcategory', 'NaijaapiController@subaddcategory');
	Route::get('subviewcategory/{id}', 'NaijaapiController@subviewcategory');
	Route::post('subupdatecategory', 'NaijaapiController@subupdatecategory');
	Route::get('subcat_delete/{id}', 'NaijaapiController@subcat_delete');

	//Payment transaction
	Route::get('merchant-histroy', 'HistroyController@PaymentTransaction')->name('merchanthistroy');
	Route::get('merchantview/{id}', 'HistroyController@PaymentViewTransaction');

	//Admin wallets
	// Route::get('adminwallets', 'AdminAddressController@index');
	// Route::get('adminwalletssettings/{id}', 'AdminAddressController@edit');
	// Route::post('adminwalletupdate', 'AdminAddressController@adminwalletupdate');

	Route::get('feewallet/{coin}/{type}','AdminAddressController@feeWallet');

	Route::get('add-blog', 'CmsController@addBlog')->name('addBlog');
    Route::post('create-blog', 'CmsController@createBlog')->name('createBlog');
    Route::post('update-blog', 'CmsController@updateBlog')->name('updateBlog');
    Route::get('blogs-list', 'CmsController@listBlog')->name('blogsList');
    Route::get('edit-blog/{id}', 'CmsController@editBlog')->name('editBlog');
    Route::get('delete-blog/{id}', 'CmsController@deleteBlog')->name('deleteBlog');

	Route::post('cryptosendamount','AdminAddressController@cryptoSendAmount');

	Route::get('feewalletedit/{id}','AdminAddressController@feeWalletedit');
	Route::post('feewalletupdate','AdminAddressController@feewalletupdate');



	//Live Price
	Route::get('livepricelist', 'LivepriceController@livepricelist');
	Route::get('updatengnval', 'LivepriceController@updatengnval');
	Route::post('ngnpriceupdate', 'LivepriceController@ngnpriceupdate');

	//Bank
	Route::get('bank/{fiat}', 'BankController@index');
	Route::get('addbank/{fiat}', 'BankController@addbank');
	Route::post('bankadd', 'BankController@bankadd');
	Route::post('paymentadd', 'BankController@paymentadd');
	Route::get('edit_bank/{id}/{fiat}', 'BankController@editBank');
	Route::post('updateBank', 'BankController@updateBank');
	//subadmin
	Route::get('/subadminlist','SubAdminController@index');
	Route::get('/subadminform','SubAdminController@create');
	Route::post('/subadmincreated','SubAdminController@store');
	Route::get('/subadminedit/{id}','SubAdminController@show');
	Route::post('/subadminupdate/{id}','SubAdminController@update');
	Route::get('/subadminremove/{id}','SubAdminController@destroy');
	Route::get('/subadminsearch', 'SubAdminController@subadminsearch');
	Route::get('/subadminchangepassword/{id}','SubAdminController@subadminchangepassword');
	Route::post('/subadminpassupdate/{id}','SubAdminController@subadminpassupdate');
	Route::post('/changetwofa','SubAdminController@changetwofaupdate');
	Route::get('/resettwofa','SubAdminController@resettwofa');

	//kyc settings
	Route::get('securityview', 'SettingsController@securityview');
	Route::post('securityupdate', 'SettingsController@update_kyc');

	//Admin Fee Wallet
    Route::get('feewallet/{coin}','AdminWalletController@feeWallet');

});

Route::get('sendtest', 'CronController@sendtest');
//Clear Cache facade value:
Route::get('/clear-cache', function() {
    $exitCode = Artisan::call('cache:clear');
    return '<h1>Cache facade value cleared</h1>';
});

//Reoptimized class loader:
Route::get('/optimize', function() {
    $exitCode = Artisan::call('optimize');
    return '<h1>Reoptimized class loader</h1>';
});

//Route cache:
Route::get('/route-cache', function() {
    $exitCode = Artisan::call('route:cache');
    return '<h1>Routes cached</h1>';
});

//Clear Route cache:
Route::get('/route-clear', function() {
    $exitCode = Artisan::call('route:clear');
    return '<h1>Route cache cleared</h1>';
});

//Clear View cache:
Route::get('/view-clear', function() {
    $exitCode = Artisan::call('view:clear');
    return '<h1>View cache cleared</h1>';
});

//Clear Config cache:
Route::get('/config-cache', function() {
    $exitCode = Artisan::call('config:cache');
    return '<h1>Clear Config cleared</h1>';
});
Route::get('setlocale/{locale}', function ($locale) {
  if (in_array($locale, \Config::get('app.locales'))) {
    Session::put('locale', $locale);
  }
  return redirect()->back();
});
