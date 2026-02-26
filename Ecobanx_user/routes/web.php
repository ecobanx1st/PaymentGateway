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

use SimpleSoftwareIO\QrCode\Facades\QrCode;

Route::get('/old-home', function () {
    return view('welcome');
});

Route::get('/', function () {
    if(Auth::check()) {
        return redirect('/dashboard');
    } else {
        return view('auth.login');
    }
});
Route::get('/buycrypto', function () {
    return view('outerpage.buycrypto');
});

Route::get('/supported-coins', function () {
    return view('outerpage.supportedcoins');
});
Route::get('/merchant-tool', function () {
    return view('outerpage.merchanttool');
});
Route::get('/fees', function () {
    return view('outerpage.fees');
});
Route::get('/aboutus', function () {
    return view('outerpage.aboutus');
});
Route::get('/restricted-jurisdictions', function () {
    return view('outerpage.restricted');
});
Route::get('/user-agreement', function () {
    return view('outerpage.useragreement');
});

Route::get('/privacy-policy', function () {
    return view('outerpage.privacypolicy');
});
// Route::get('/kycpage', function () {
//     return view('kycpage');
// });



Auth::routes();

Route::get('/home', 'HomeController@index')->name('home');
Route::get('/all-supported-coins', 'HomeController@allSupportedCoins')->name('allsupportedcoins');

Route::get('/reconfirm_account/{email}', 'Auth\LoginController@reconfirm_account')->name('reconfirm_account');
Route::get('logout', '\App\Http\Controllers\Auth\LoginController@logout');
Route::get('/verifyEmail', 'Auth\RegisterController@verifyEmail')->name('verifyEmail');
Route::get('/verify/{email}', 'EmailVerifyController@sendEmailDone')->name('sendEmailDone');
Route::get('/res/{referral_code}', 'Auth\RegisterController@res')->name('res');
Route::get('/registersuccess', 'EmailVerifyController@registerSuccess')->name('registersuccess');

//Two Factor Verification
Route::get('security', 'DashboardController@TwoFaEnable')->name('security');
Route::get('verify-access', 'DashboardController@dashboard')->name('verifyAccess');
Route::get('twofaverfication', 'DashboardController@TwoFactorVerfication')->name('twofaverfication');
Route::get('enablegoogle', 'DashboardController@EnableGoogleAuth')->name('enablegoogle');
Route::get('enableemail', 'DashboardController@EnableEmail')->name('enableemail');
Route::get('disablegoogleauth', 'DashboardController@DisableGoogleAuth')->name('disablegoogleauth');
Route::get('disableemail', 'DashboardController@DisableEmail')->name('enableemail');
Route::post('verifyemail', 'DashboardController@EnableGoogleAuth')->name('verifyemail');
Route::post('verifygoogleauth', 'DashboardController@VerifyGoogleAuth')->name('verifygoogleauth');
Route::post('verifyemailotp', 'DashboardController@VerifyEmail')->name('verifyemailotp');
Route::post('ajaxapikeyshow', 'DashboardController@Ajaxapikeyshow')->name('ajaxapikeyshow');
Route::post('otpkeycheck', 'DashboardController@Otpkeycheck')->name('otpkeycheck');

//Userpanel
Route::get('dashboard', 'UserpanelController@Userpanel')->name('dashboard');
Route::get('userpanel', 'UserpanelController@Userpanel')->name('userpanel');
Route::get('profile', 'UserpanelController@profile')->name('profile');
Route::post('userprofile', 'UserpanelController@persinoaldetais_update')->name('userprofile');
Route::post('changepassword', 'UserpanelController@changepwd');
Route::get('security_two', 'UserpanelController@security_two');
Route::get('trans_view/{id}', 'UserpanelController@TransactionView');
Route::get('kyc', 'UserpanelController@kycindex');
Route::post('uploadkyc', 'UserpanelController@uploadkyc');
Route::post('upload-photo', 'UserpanelController@uploadProfilePic')->name('uploadProfile');

//Sumsub KYC
Route::get('kyc-verify', 'SumsubKycController@kycdisplayer')->name('kyc-verify');
Route::post('kyc-save', 'SumsubKycController@kycsubmits')->name('kyc-save');

// Route::get('kyc-verify', 'SumsubKycController@index')->name('kycsumsub');
Route::get('kycform','SumsubKycController@kycForm')->name('kycform');
Route::get('/sumsubkyc', 'SumsubKycController@index')->name('sumsubkyc');
Route::post('/ajaxkyc', 'SumsubKycController@ajaxkyc')->name('ajaxkyc');
Route::get('/kycstatus', 'SumsubKycController@kycstatus')->name('kycstatus');

//Support Ticket
Route::get('/support', 'SupportController@supportView')->name('support');
Route::get('/support-ticket/{ticket_id}', 'SupportController@supportView');
Route::post('submitNewTicket', 'SupportController@submitNewTicket')->name('submitNewTicket');
Route::get('viewTicket/{id}', 'SupportController@viewTicket')->name('viewTicket');
Route::post('sendMessage', 'SupportController@sendMessage')->name('sendMessage');
Route::post('ticket-search', 'SupportController@searchTicket')->name('ticket-search');

//wallet
Route::get('wallet', 'WalletController@index')->name('wallet');
Route::get('deposit/{coin}', 'WalletController@Deposit')->name('deposit');
Route::get('withdraw/{coin}', 'WalletController@Withdraw')->name('withdraw');
Route::get('/fiatdeposit/{fiat_name}', 'WalletController@fiatdeposit')->name('fiatdeposit');
Route::get('/fiatwithdraw/{coin}', 'WalletController@fiatwithdraw')->name('fiatwithdraw');
Route::get('/carddropdown', 'WalletController@carddropdown')->name('carddropdown');
Route::post('/sendWithdrawRequest', 'WalletController@validatefiatWithdraw')->name('sendWithdrawRequest');
Route::get('/email_withdrawpage', 'WalletController@email_withdrawpage')->name('email_withdrawpage');
Route::post('/uploadProof', 'WalletController@uploadProof')->name('uploadProof');

//Withdraw
Route::post('/verifywithdraw', 'WalletController@ValidateCryptoWithdraw')->name('verifywithdraw');
Route::get('/withdrawconform', 'WalletController@WithdrawOTP')->name('withdrawotp');
Route::post('/otp_function', 'WalletController@otp_function')->name('otp_function');
Route::post('/validateotp', 'WalletController@withdrawstore')->name('validateotp');

//Histroy
Route::get('transaction-history', 'HistroyController@TransactionHistroy')->name('accounthistroy');
Route::get('deposit-history', 'HistroyController@DepositHistroy')->name('deposithistroy');
Route::get('withdraw-history', 'HistroyController@WithdrawHistroy')->name('withdrawhistroy');
Route::get('deposit-history/{coin}', 'HistroyController@DepositHistroy');
Route::get('withdrawhistroy/{coin}', 'HistroyController@WithdrawHistroy');
Route::get('user_rans_view/{id}', 'HistroyController@UserTransactionView');
Route::get('overallhistroy', 'HistroyController@overallhistroy');

//account and merchant
Route::get('account-setting', 'MyAccountController@BasicsSettings')->name('basicsetting');
Route::post('account-setting-update', 'MyAccountController@BasicsSettingsUpdate');
Route::get('merchant-setting', 'MyAccountController@MerchantSettings')->name('merchantsetting');
Route::post('merchant-setting-create', 'MyAccountController@MerchantSettingsCreate');

//Multiple remove api keys
Route::post('api-remove', 'MyAccountController@ApiRemove');

Route::get('ipn-history', 'MyAccountController@IPNHistroy')->name('ipnhistroy');
Route::get('key-list', 'MyAccountController@APIKey')->name('apikeylist');
Route::get('create-api', 'MyAccountController@CreateUserAPI')->name('addapi');
Route::get('edit-key/{id}', 'MyAccountController@APIKeyEdit')->name('editkey');
Route::post('api-setting', 'MyAccountController@APIKeysettingCreate');
Route::post('api-setting-permission', 'MyAccountController@APIKeyPermission');
Route::get('empty-api-setting/{id}', 'MyAccountController@Emptyapisetting');
Route::get('empty-api-permission/{id}', 'MyAccountController@EmptyapiPermission');

//Merchant Tools
Route::get('merchant-tools', 'MerchantController@index')->name('merchanttools');
Route::get('button-maker', 'MerchantController@ButtonMaker')->name('buttonmaker');
Route::post('button-maker-submit', 'MerchantController@ButtonMakerSubmit')->name('button-maker-submit');
Route::get('button-maker-submit', 'MerchantController@ButtonMakerSubmit')->name('button-maker-submit');
Route::get('merchant-tools-simple', 'MerchantController@MerchantToolSimple')->name('merchanttoolssimple');
Route::get('example-buttons', 'MerchantController@ExampleButtons')->name('examplebuttons');
Route::get('merchant-tools-ipn', 'MerchantController@MerchantToolIPN')->name('merchanttoolipn');
Route::get('Hashcodexment-api', 'MerchantController@NaijacryptoAPI')->name('bbpaymentapi');

//Invoice marker
Route::get('view-invoice', 'MerchantController@viewinvoice')->name('viewinvoice');
Route::get('editinvoice/{id}', 'MerchantController@editinvoice')->name('editinvoice');
Route::get('deleteinvoice/{id}', 'MerchantController@deleteinvoice')->name('deleteinvoice');
Route::get('shareinvoice/{id}', 'MerchantController@shareinvoice')->name('shareinvoice');
Route::post('checkamount', 'MerchantController@checkamount')->name('checkamount');

Route::get('invoice-maker', 'MerchantController@InvoiceMaker')->name('invoicemaker');
Route::post('invoice-maker-submit', 'MerchantController@InvoiceMakerSubmit')->name('invoice-maker-submit');
Route::post('updateinvoice', 'MerchantController@updateinvoice')->name('updateinvoice');
Route::get('deleteitem/{id}', 'MerchantController@deleteitem')->name('deleteitem');
Route::post('generateLink', 'MerchantController@generateLink')->name('generateLink');

Route::get('view-request-invoice', 'MerchantController@viewrequestinvoice')->name('requestpayment');
Route::get('request-invoice-maker', 'MerchantController@InvoiceRequestMaker')->name('requestinvoicemaker');
Route::post('request-invoice-maker-submit', 'MerchantController@InvoiceRequestMakerSubmit');
Route::get('editrequestinvoice/{id}', 'MerchantController@editrequestinvoice')->name('editrequestinvoice');
Route::post('updaterequestinvoice', 'MerchantController@updaterequestinvoice')->name('updaterequestinvoice');

Route::get('invoice-builder', 'MerchantController@invoicebuilder')->name('invoiceBuilder');
Route::post('make-invoice', 'MerchantController@createinvoicebuilder')->name('makeInvoiceBuilder');
Route::get('invoiceBuilder2', 'MerchantController@invoiceBuilder2')->name('invoiceBuilder2');
///Ajax Live
Route::post('live-price-cal', 'MerchantController@livePriceCalculate')->name('calLiveprice');

//Merchant Transaction
Route::post('makepayment', 'TransactionController@index');
Route::get('checkout', 'TransactionController@showCheckout')->name('checkout');
Route::post('create-transaction', 'TransactionController@CreateTransaction')->name('makeorder');
Route::get('payment-scan/{txid}', 'TransactionController@PaymentCrypto')->name('paymentscan');
Route::get('view/{cid}/{sid}', 'MerchantController@merchant_api')->name('merchant_api');
Route::get('posdeposit', 'TransactionController@posDeposit')->name('posdeposit');
Route::get('ordertrans', 'CronController@OrderTrans');
Route::get('resentOrderTrans/{id}', 'CronController@ResentOrderTrans');
Route::get('callback_url', 'TransactionController@UpdatePaymentStatus');

Route::get('advance-button-maker', 'MerchantController@AdvanceButtonMaker')->name('advancebuttonmaker');
Route::post('generate-advance-button-maker', 'MerchantController@advanceButtonMakerSubmit')->name('generateadvancebuttonmaker');
Route::get('advance-merchant-tools-simple', 'MerchantController@AdvanceMerchantToolsSimple')->name('advancemerchanttoolssimple');
Route::get('advance-example-buttons', 'MerchantController@AdvanceExampleButtons')->name('advanceexamplebuttons');


Route::get('shop-card-field', 'MerchantController@ShopCardField')->name('shopcardfield');
Route::get('shop-button-examples', 'MerchantController@shopButtonExamples')->name('shopbuttonexamples');
Route::get('shop-button-image', 'MerchantController@shopButtonImage')->name('shopbuttonImage');

Route::get('donation-button', 'MerchantController@donationButton')->name('donationButton');
Route::post('donation-button-make', 'MerchantController@donationButtonMake')->name('donationButtonsubmit');
Route::get('donation-field', 'MerchantController@donationField')->name('donationField');
Route::get('donation-button-example', 'MerchantController@donationbuttonExample')->name('donationbuttonExample');


Route::get('naijapayment-api', 'MerchantController@APIDocumentation')->name('APIDocumentation');


Route::get('PaymentCancelledError', 'MerchantController@PaymentCancelledError')->name('PaymentCancelledError');
Route::get('PaymentSuccess', 'MerchantController@PaymentSuccess')->name('PaymentSuccess');


Route::get('posTutorial', 'MerchantController@posTutorial')->name('posTutorial');
Route::get('posHtmlFields', 'MerchantController@posHtmlFields')->name('posHtmlFields');
Route::get('posbutton', 'MerchantController@posbutton')->name('posbutton');
Route::get('posExample', 'MerchantController@posExample')->name('posExample');
Route::get('posExample2', 'MerchantController@posExample2')->name('posExample2');
Route::get('posExample3', 'MerchantController@posExample3')->name('posExample3');



Route::post('payment_success', 'TransactionController@ReturnPaymentSuccess');
Route::get('PaymentSuccessStatus/{id}', 'TransactionController@success_url');

Route::post('return_received/', 'TransactionController@ReturnReceived');
Route::get('cancel-payment/{tid}', 'TransactionController@CancelPayment');

Route::get('invoice-payment/{id}', 'TransactionController@invoicepayment');
Route::get('payout', 'TransactionController@showpayout')->name('payout');
Route::post('create-invoice-payment', 'TransactionController@CreateInvoiceTransaction')->name('makeinvoiceorder');
Route::post('makeinvoiceordercode', 'TransactionController@makeinvoiceordercode')->name('makeinvoiceordercode');

//Instant BUY/SELL
Route::get('instanttrade/{coinone}/{cointwo}', 'InstantController@InstantTrade');
Route::post('currentprice', 'InstantController@Getcurrentprice');
Route::post('instant_calculation', 'InstantController@instant_calculation');
Route::post('instantsubmit', 'InstantController@instantsubmit');
Route::get('/instanthistory/{displaytype}', 'HistoryController@Instanthistory');

//Invoice
Route::get('invoiceview/{id}', 'InvoiceController@InvoiceView');

Route::get('testdata', 'TestController@testdata')->name('testdata');

Route::get('/help-center', 'HomeController@Helpcenter');

Route::get('delete-apikey/{id}', 'MyAccountController@ApiSingleRemover');


Route::get('/qr-code/{ethaddress}', function ($ethaddress) {
    // Generate the QR code image using the provided $ethaddress
    $qrCode = QrCode::size(150)->generate($ethaddress);

    // Return a response with the QR code image
    return $qrCode;
})->name('qr');
