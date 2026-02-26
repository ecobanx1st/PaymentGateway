@php $title = "Merchant Tool IPN"; $atitle ="merchant";
@endphp
@include('layouts.headercss')
</section>
</header>


<section class="Dashboard-page">
  <div class="container-fluid">
     <div class="row">

      @include('layouts.menu')


        <div class="col-lg-10 col-xl-10 col-md-12 col-sm-12 col-xs-12">

               <div class="header-part-outer">

                <div class="common-header-style title-outer">
                  <div class="row">

                    <div class="col-lg-6 col-xl-6 col-md-6 col-sm-6 col-xs-6">
                      <div class="logo-payment"><a href="dashboard.html"><img src="img/logo.png" alt="logo"></a></div>
                    </div>

                    <div class="col-lg-6 col-xl-6 col-md-6 col-sm-6 col-xs-6">
                      <div class="notify-part">
                        <div class="notify"><img src="img/Notification.png"></div>
                        <div class="message"><img src="img/message.png"></div>
                      </div>
                    </div>

                  </div>
                </div>

                <div class="head-title-part">
                  <h1>Merchant</h1>
                  <!-- <p>We are on a mission to help developers like you to build beautiful projects for free.</p> -->
                </div>

              </div>

			  <article class="inner-banner">
	<section class="loginbg inner-banner-ht buttonmaker">
		<div class="container">
			<div class="col-md-12 col-sm-12 col-xs-12 center-content securitybox">
				<h3 class="text-center fnt-bld inner-heading">Instant Payment Notifications (IPN)</h3>
				<h4 class="subt text-center pb-30">* Testing Note: The system will only let you have 3 transactions at a time in the 'Waiting for funds...' state (as a buyer, no limit for sellers)</h4>	
				<div class="form-container">
					<form action='#' method='post' enctype='multipart/form-data'>
						<div class="ipnbg">
							<div class="examplecodebg">
								<div class="row">
									<div class="col-md-6">
										<ul class="listsetup">
											<li><a href="#intro"><i class="fa fa-angle-right"></i>Introduction</a></li>
											<li><a href="#setup"><i class="fa fa-angle-right"></i>IPN Setup</a></li>
											<li><a href="#ipnretries"><i class="fa fa-angle-right"></i>IPN Retries</a></li>
											<li><a href="#auth"><i class="fa fa-angle-right"></i>Authenticating IPNs</a></li>								
										</ul>
									</div>
									<div class="col-md-6">
										<ul class="listsetup">								
											<li><a href="#statuses"><i class="fa fa-angle-right"></i>Payment Statuses</a></li>
											<li><a href="#code"><i class="fa fa-angle-right"></i>Code Samples</a></li>
											<li><a href="#fields"><i class="fa fa-angle-right"></i>IPN POST Fields</a></li>	
										</ul>
									</div>
								</div>
								<div id="intro">
									<h4 class="subt-t fnt-reg">Introduction</h4>
									<p class="content">The IPN system will notify your server when you receive a payment and when a payment status changes. This is a easy and useful way to integrate our payments into your software to automate order completion, digital downloads, accounting, or whatever you can think up. It is implemented by making a HTTP POST call over a https:// or http:// URL to a script or CGI program on your server.</p>
								</div>
								<div id="setup">
									<h4 class="subt-t fnt-reg">IPN Setup</h4>
									<p class="content">The first step is to go to the My Settings page and set a IPN Secret. Your IPN Secret is a string of your choosing that is used to verify that an IPN was really sent from our servers (recommended to be a random string of letters, numbers, and special characters). Our system will not send any IPNs unless you have an IPN Secret set. See the "Authenticating IPNs" section for more details.At the same time you can optionally set an IPN URL; this is the URL that will be called when sending you IPN notifications. You can also set an IPN URL in your Buy Now and Cart buttons that will be used instead of this one.</p>
								</div>
								<div id="ipnretries">
									<h4 class="subt-t fnt-reg">IPN Retries / Duplicate IPNs</h4>
									<p class="content">If there is an error sending your server an IPN, we will retry up to 10 times. Because of this you are not guaranteed to receive every IPN (if all 10 tries fail) or that your server will receive them in order. Your IPN handler must always check to see if a payment has already been handled before to avoid double-crediting users, etc. in the case of duplicate IPNs.</p>
								</div>
								<div id="auth">
									<h4 class="subt-t fnt-reg">Authenticating IPNs</h4>
									<p class="content">We use your IPN Secret as the HMAC shared secret key to generate an HMAC signature of the raw POST data. The HMAC signature is sent as a HTTP header called HMAC.Here is what it would look like in PHP :</p>	<small>
										$merchant_id = 'Your_Merchant_ID';<br>
										$secret = 'Your_IPN_Secret';<br>
										<br>
										if (!isset($_SERVER['HTTP_HMAC']) || empty($_SERVER['HTTP_HMAC'])) {<br>
										&nbsp;&nbsp;die("No HMAC signature sent");<br>
										}<br>
										<br>
										$merchant = isset($_POST['merchant']) ? $_POST['merchant']:'';<br>
										if (empty($merchant)) {<br>
										&nbsp;&nbsp;die("No Merchant ID passed");<br>
										}<br>
										<br>
										if ($merchant != $merchant_id) {<br>
										&nbsp;&nbsp;die("Invalid Merchant ID");<br>
										}<br>
										<br>
										$post_hmac = "merchant=".$merchant."&txn_id=".$txn_id."&amount1=".$amount1."&amount2=".$amount2."&currency1=".$currency1."&currency2=".$currency2."&status=".$status;<br>
	
    									$hmac = hash_hmac("sha512", $post_hmac, trim($secret));<br>
										if ($hmac != $_SERVER['HTTP_HMAC']) {<br>
										&nbsp;&nbsp;die("HMAC signature does not match");<br>
										}<br>
										<br>
									</small>
								</div>
								<div id="statuses">
									<h4 class="subt-t fnt-reg">Payment Statuses</h4>
									<p class="content">Payments will post with a 'status' field, here are the currently defined values:</p>
									<ul class="content">
										<li>-1 = Cancelled / Timed Out</li>
										<li>0 = Waiting for buyer funds</li>
										<li>1 = We have confirmed coin reception from the buyer</li>
										<li>2 = Queued for nightly payout (if you have the Payout Mode for this coin set to Nightly)</li>
										<li>100 = Payment Complete. We have sent your coins to your payment address or 3rd party payment system reports the payment complete</li>
									</ul>
									<p class="content">For future-proofing your IPN handler you can use the following rules:</p>
									<ul class="content">
										<li>&lt;0 = Failures/Errors</li>
										<li>0-99 = Payment is Pending in some way</li>
										<li>&gt;=100 = Payment completed successfully</li>
									</ul>
								</div>
							</div>
							<div id="fields">
								<h4 class="subt-t fnt-reg text-center">IPN POST Fields</h4>
								<div class="table-responsive" data-simplebar>
									<table class="table table-small-font no-mb table-borderded">
										<thead>
											<tr>
												<th>Field Name</th>
												<th class="text-center">Description</th>
												<th>Required?</th>
											</tr>
										</thead>
										<tbody>
											<tr>
												<th class="text-center" colspan="3">Required Fields
												<br/>These fields will be here for all IPN types.</th>
											</tr>
											
											<tr>
												<td>ipn_version</td>
												<td>1.0</td>
												<td>Yes</td>
											</tr>
											<tr>
												<td>ipn_type</td>
												<td>Currently: 'simple, 'button', 'cart', 'donation', 'deposit', or 'api'</td>
												<td>Yes</td>
											</tr>
											<tr>
												<td>ipn_mode</td>
												<td>Currently: 'hmac'</td>
												<td>Yes</td>
											</tr>
											<tr>
												<td>ipn_id</td>
												<td>The unique identifier of this IPN</td>
												<td>Yes</td>
											</tr>
											<tr>
												<td>merchant</td>
												<td>Your merchant ID (you can find this on the My Account page).</td>
												<td>Yes</td>
											</tr>
											<tr>
												<th colspan="4" class="text-center">Deposit Information (ipn_type = 'deposit')</th>
											</tr>
											<tr>
												<td>txn_id</td>
												<td>The coin transaction ID of the payment.</td>
												<td>Yes</td>
											</tr>
											<tr>
												<td>address</td>
												<td>Coin address the payment was received on.</td>
												<td>Yes</td>
											</tr>
											<tr>
												<td>dest_tag</td>
												<td>For coins that use an extra tag it will include it here. For example Ripple Destination Tag, Monero Payment ID, etc.</td>
												<td>No</td>
											</tr>
											<tr>
												<td>status</td>
												<td>Numeric status of the payment, currently 0 = pending and 100 = confirmed/complete. For future proofing you should use the same logic as Payment Statuses.
												<br>IMPORTANT: You should never ship/release your product until the status is &gt;= 100</td>
												<td>Yes</td>
											</tr>
											<tr>
												<td>status_text</td>
												<td>A text string describing the status of the payment. (useful for displaying in order comments)</td>
												<td>Yes</td>
											</tr>
											<tr>
												<td>currency</td>
												<td>The coin the buyer paid with.</td>
												<td>Yes</td>
											</tr>
											<tr>
												<td>confirms</td>
												<td>The number of confirms the payment has.</td>
												<td>Yes</td>
											</tr>
											<tr>
												<td>amount</td>
												<td>The total amount of the payment</td>
												<td>Yes</td>
											</tr>
											<tr>
												<td>amounti</td>
												<td>The total amount of the payment in Satoshis</td>
												<td>Yes</td>
											</tr>
											<tr>
												<td>fee</td>
												<td>The fee deducted by paymentgatewaydemo (only sent when status &gt;= 100)</td>
												<td>No</td>
											</tr>
											<tr>
												<td>feei</td>
												<td>The fee deducted by paymentgatewaydemo in Satoshis (only sent when status &gt;= 100)</td>
												<td>No</td>
											</tr>
											<tr>
												<td>fiat_coin</td>
												<td>The ticker code of the fiat currency you selected on the Merchant Settings tab of the Account Settings page (USD, EUR, etc.) Make sure to check this for accuracy for security in your IPN handler!</td>
												<td>Yes</td>
											</tr>
											<tr>
												<td>fiat_amount</td>
												<td>The total amount of the payment in the fiat currency you selected on the Merchant Settings tab of the Account Settings page.</td>
												<td>Yes</td>
											</tr>
											<tr>
												<td>fiat_amounti</td>
												<td>The total amount of the payment in the fiat currency you selected in Satoshis</td>
												<td>Yes</td>
											</tr>
											<tr>
												<td>fiat_fee</td>
												<td>The fee deducted by paymentgatewaydemo in the fiat currency you selected (only sent when status &gt;= 100)</td>
												<td>No</td>
											</tr>
											<tr>
												<td>fiat_feei</td>
												<td>The fee deducted by paymentgatewaydemo in the fiat currency you selected in Satoshis (only sent when status &gt;= 100)</td>
												<td>No</td>
											</tr>
											<tr>
												<th colspan="3" class="text-center">Withdrawal Information (ipn_type = 'withdrawal')</th>
											</tr>
											<tr>
												<td>id</td>
												<td>The ID of the withdrawal ('id' field returned from 'create_withdrawal'.)</td>
												<td>Yes</td>
											</tr>
											<tr>
												<td>status</td>
												<td>Numeric status of the withdrawal, currently 0 = waiting email confirmation, 1 = pending, and 2 = sent/complete.</td>
												<td>Yes</td>
											</tr>
											<tr>
												<td>status_text</td>
												<td>A text string describing the status of the withdrawal.</td>
												<td>Yes</td>
											</tr>
											<tr>
												<td>address</td>
												<td>Coin address the withdrawal was sent to.</td>
												<td>Yes</td>
											</tr>
											<tr>
												<td>txn_id</td>
												<td>The coin transaction ID of the withdrawal.</td>
												<td>No</td>
											</tr>
											<tr>
												<td>currency</td>
												<td>The coin of the withdrawal.</td>
												<td>Yes</td>
											</tr>
											<tr>
												<td>amount</td>
												<td>The total amount of the withdrawal</td>
												<td>Yes</td>
											</tr>
											<tr>
												<td>amounti</td>
												<td>The total amount of the withdrawal in Satoshis</td>
												<td>Yes</td>
											</tr>
											<tr>
												<th colspan="3" class="text-center">Buyer Information (ipn_type = 'simple','button','cart','donation')</th>
											</tr>
											<tr>
												<td>first_name</td>
												<td>Buyer's first name.
												<br>Note: Only first_name or last_name is required, either may be empty but not both.</td>
												<td>Yes</td>
											</tr>
											<tr>
												<td>last_name</td>
												<td>Buyer's last name.
												<br>Note: Only first_name or last_name is required, either may be empty but not both.</td>
												<td>Yes</td>
											</tr>
											<tr>
												<td>company</td>
												<td>Buyer's company name.</td>
												<td>No</td>
											</tr>
											<tr>
												<td>email</td>
												<td>Buyer's email address.</td>
												<td>Yes</td>
											</tr>
											<tr>
												<th colspan="3" class="text-center">Shipping Information (ipn_type = 'simple','button','cart','donation')
												<br>If 'want_shipping' was set to 1 we will collect and forward shipping information, but as always they could have manually messed with your button so be sure to verify it.</th>
											</tr>
											<tr>
												<td>address1</td>
												<td>Street / address line 1</td>
												<td>No</td>
											</tr>
											<tr>
												<td>address2</td>
												<td>Street / address line 2</td>
												<td>No</td>
											</tr>
											<tr>
												<td>city</td>
												<td>City</td>
												<td>No</td>
											</tr>
											<tr>
												<td>state</td>
												<td>State / Province</td>
												<td>No</td>
											</tr>
											<tr>
												<td>zip</td>
												<td>Zip / Postal Code</td>
												<td>No</td>
											</tr>
											<tr>
												<td>country</td>
												<td>Country of Residence
												<br>This uses 2 digit ISO 3166 country codes.</td>
												<td>No</td>
											</tr>
											<tr>
												<td>country_name</td>
												<td>Country of Residence
												<br>This is a pretty version such as UNITED STATES or CANADA.</td>
												<td>No</td>
											</tr>
											<tr>
												<td>phone</td>
												<td>Phone Number</td>
												<td>No</td>
											</tr>
											<tr>
												<th colspan="3" class="text-center">Simple Button Fields (ipn_type = 'simple')</th>
											</tr>
											<tr>
												<td>status</td>
												<td>The status of the payment. See Payment Statuses for details.</td>
												<td>Yes</td>
											</tr>
											<tr>
												<td>status_text</td>
												<td>A text string describing the status of the payment. (useful for displaying in order comments)</td>
												<td>Yes</td>
											</tr>
											<tr>
												<td>txn_id</td>
												<td>The unique ID of the payment.
												<br>Your IPN handler should be able to handle a txn_id composed of any combination of a-z, A-Z, 0-9, and - up to 128 characters long for future proofing.</td>
												<td>Yes</td>
											</tr>
											<tr>
												<td>currency1</td>
												<td>The original currency/coin submitted in your button.
												<br>Note: Make sure you check this, a malicious user could have changed it manually.</td>
												<td>Yes</td>
											</tr>
											<tr>
												<td>currency2</td>
												<td>The coin the buyer chose to pay with.</td>
												<td>Yes</td>
											</tr>
											<tr>
												<td>amount1</td>
												<td>The total amount of the payment in your original currency/coin.</td>
												<td>Yes</td>
											</tr>
											<tr>
												<td>amount2</td>
												<td>The total amount of the payment in the buyer's selected coin.</td>
												<td>Yes</td>
											</tr>
											<tr>
												<td>subtotal</td>
												<td>The subtotal of the order before shipping and tax in your original currency/coin.</td>
												<td>Yes</td>
											</tr>
											<tr>
												<td>shipping</td>
												<td>The shipping charged on the order in your original currency/coin.</td>
												<td>Yes</td>
											</tr>
											<tr>
												<td>tax</td>
												<td>The tax on the order in your original currency/coin.</td>
												<td>Yes</td>
											</tr>
											<tr>
												<td>fee</td>
												<td>The fee on the payment in the buyer's selected coin.</td>
												<td>Yes</td>
											</tr>
											<tr>
												<td>net</td>
												<td>The net amount you received of the buyer's selected coin after our fee and any coin TX fees to send the coins to you.</td>
												<td>Yes</td>
											</tr>
											<tr>
												<td>item_amount</td>
												<td>The amount of the item/order in the original currency/coin.</td>
												<td>Yes</td>
											</tr>
											<tr>
												<td>item_name</td>
												<td>The name of the item that was purchased.</td>
												<td>Yes</td>
											</tr>
											<tr>
												<td>item_desc</td>
												<td>Description of the item that was purchased.</td>
												<td>No</td>
											</tr>
											<tr>
												<td>item_number</td>
												<td>This is a passthru variable for your own use. [visible to buyer]</td>
												<td>No</td>
											</tr>
											<tr>
												<td>invoice</td>
												<td>This is a passthru variable for your own use. [not visible to buyer]</td>
												<td>No</td>
											</tr>
											<tr>
												<td>custom</td>
												<td>This is a passthru variable for your own use. [not visible to buyer]</td>
												<td>No</td>
											</tr>
											<tr>
												<td>on1</td>
												<td>1st option name. This lets you pass through a buyer option like size or color.</td>
												<td>No
												<br>(unless ov1 set)</td>
											</tr>
											<tr>
												<td>ov1</td>
												<td>1st option value. This would be the buyer's selection such as small, large, red, white.</td>
												<td>No</td>
											</tr>
											<tr>
												<td>on2</td>
												<td>2nd option name. This lets you pass through a buyer option like size or color.</td>
												<td>No
												<br>(unless ov2 set)</td>
											</tr>
											<tr>
												<td>ov2</td>
												<td>2nd option value. This would be the buyer's selection such as small, large, red, white.</td>
												<td>No</td>
											</tr>
											<tr>
												<td>send_tx</td>
												<td>The TX ID of the payment to the merchant. Only included when 'status' &gt;= 100 and if the payment mode is set to ASAP or Nightly or if the payment is PayPal Passthru.</td>
												<td>No</td>
											</tr>
											<tr>
												<td>received_amount</td>
												<td>The amount of currency2 received at the time the IPN was generated.</td>
												<td>No</td>
											</tr>
											<tr>
												<td>received_confirms</td>
												<td>The number of confirms of 'received_amount' at the time the IPN was generated.</td>
												<td>No</td>
											</tr>
											<tr>
												<th colspan="3" class="text-center">Advanced Button Fields (ipn_type = 'button')</th>
											</tr>
											<tr>
												<td>status</td>
												<td>The status of the payment. See Payment Statuses for details.</td>
												<td>Yes</td>
											</tr>
											<tr>
												<td>status_text</td>
												<td>A text string describing the status of the payment. (useful for displaying in order comments)</td>
												<td>Yes</td>
											</tr>
											<tr>
												<td>txn_id</td>
												<td>The unique ID of the payment.
												<br>Your IPN handler should be able to handle a txn_id composed of any combination of a-z, A-Z, 0-9, and - up to 128 characters long for future proofing.</td>
												<td>Yes</td>
											</tr>
											<tr>
												<td>currency1</td>
												<td>The original currency/coin submitted in your button.
												<br>Note: Make sure you check this, a malicious user could have changed it manually.</td>
												<td>Yes</td>
											</tr>
											<tr>
												<td>currency2</td>
												<td>The coin the buyer chose to pay with.</td>
												<td>Yes</td>
											</tr>
											<tr>
												<td>amount1</td>
												<td>The total amount of the payment in your original currency/coin.</td>
												<td>Yes</td>
											</tr>
											<tr>
												<td>amount2</td>
												<td>The total amount of the payment in the buyer's selected coin.</td>
												<td>Yes</td>
											</tr>
											<tr>
												<td>subtotal</td>
												<td>The subtotal of the order before shipping and tax in your original currency/coin.</td>
												<td>Yes</td>
											</tr>
											<tr>
												<td>shipping</td>
												<td>The shipping charged on the order in your original currency/coin.</td>
												<td>Yes</td>
											</tr>
											<tr>
												<td>tax</td>
												<td>The tax on the order in your original currency/coin.</td>
												<td>Yes</td>
											</tr>
											<tr>
												<td>fee</td>
												<td>The fee on the payment in the buyer's selected coin.</td>
												<td>Yes</td>
											</tr>
											<tr>
												<td>net</td>
												<td>The net amount you received of the buyer's selected coin after our fee and any coin TX fees to send the coins to you.</td>
												<td>Yes</td>
											</tr>
											<tr>
												<td>item_amount</td>
												<td>The amount per-item in the original currency/coin.</td>
												<td>Yes</td>
											</tr>
											<tr>
												<td>item_name</td>
												<td>The name of the item that was purchased.</td>
												<td>Yes</td>
											</tr>
											<tr>
												<td>quantity</td>
												<td>The quantity of items bought.</td>
												<td>Yes</td>
											</tr>
											<tr>
												<td>item_number</td>
												<td>This is a passthru variable for your own use. [visible to buyer]</td>
												<td>No</td>
											</tr>
											<tr>
												<td>invoice</td>
												<td>This is a passthru variable for your own use. [not visible to buyer]</td>
												<td>No</td>
											</tr>
											<tr>
												<td>custom</td>
												<td>This is a passthru variable for your own use. [not visible to buyer]</td>
												<td>No</td>
											</tr>
											<tr>
												<td>on1</td>
												<td>1st option name. This lets you pass through a buyer option like size or color.</td>
												<td>No
												<br>(unless ov1 set)</td>
											</tr>
											<tr>
												<td>ov1</td>
												<td>1st option value. This would be the buyer's selection such as small, large, red, white.</td>
												<td>No</td>
											</tr>
											<tr>
												<td>on2</td>
												<td>2nd option name. This lets you pass through a buyer option like size or color.</td>
												<td>No
												<br>(unless ov2 set)</td>
											</tr>
											<tr>
												<td>ov2</td>
												<td>2nd option value. This would be the buyer's selection such as small, large, red, white.</td>
												<td>No</td>
											</tr>
											<tr>
												<td>extra</td>
												<td>A note from the buyer.</td>
												<td>No</td>
											</tr>
											<tr>
												<td>send_tx</td>
												<td>The TX ID of the payment to the merchant. Only included when 'status' &gt;= 100 and if the payment mode is set to ASAP or Nightly or if the payment is PayPal Passthru.</td>
												<td>No</td>
											</tr>
											<tr>
												<td>received_amount</td>
												<td>The amount of currency2 received at the time the IPN was generated.</td>
												<td>No</td>
											</tr>
											<tr>
												<td>received_confirms</td>
												<td>The number of confirms of 'received_amount' at the time the IPN was generated.</td>
												<td>No</td>
											</tr>
											<tr>
												<th colspan="3" class="text-center">Shopping Cart Button Fields (ipn_type = 'cart')</th>
											</tr>
											<tr>
												<td>status</td>
												<td>The status of the payment. See Payment Statuses for details.</td>
												<td>Yes</td>
											</tr>
											<tr>
												<td>status_text</td>
												<td>A text string describing the status of the payment. (useful for displaying in order comments)</td>
												<td>Yes</td>
											</tr>
											<tr>
												<td>txn_id</td>
												<td>The unique ID of the payment.
												<br>Your IPN handler should be able to handle a txn_id composed of any combination of a-z, A-Z, 0-9, and - up to 128 characters long for future proofing.</td>
												<td>Yes</td>
											</tr>
											<tr>
												<td>currency1</td>
												<td>The original currency/coin submitted in your button.
												<br>Note: Make sure you check this, a malicious user could have changed it manually.</td>
												<td>Yes</td>
											</tr>
											<tr>
												<td>currency2</td>
												<td>The coin the buyer chose to pay with.</td>
												<td>Yes</td>
											</tr>
											<tr>
												<td>amount1</td>
												<td>The total amount of the payment in your original currency/coin.</td>
												<td>Yes</td>
											</tr>
											<tr>
												<td>amount2</td>
												<td>The total amount of the payment in the buyer's selected coin.</td>
												<td>Yes</td>
											</tr>
											<tr>
												<td>subtotal</td>
												<td>The subtotal of the order before shipping and tax in your original currency/coin.</td>
												<td>Yes</td>
											</tr>
											<tr>
												<td>shipping</td>
												<td>The shipping charged on the order in your original currency/coin.</td>
												<td>Yes</td>
											</tr>
											<tr>
												<td>tax</td>
												<td>The tax on the order in your original currency/coin.</td>
												<td>Yes</td>
											</tr>
											<tr>
												<td>fee</td>
												<td>The fee on the payment in the buyer's selected coin.</td>
												<td>Yes</td>
											</tr>
											<tr>
												<td>item_name_#</td>
												<td>The name of the item that was purchased. The # starts with 1.</td>
												<td>Yes</td>
											</tr>
											<tr>
												<td>item_amount_#</td>
												<td>The amount per-item in the original currency/coin.</td>
												<td>Yes</td>
											</tr>
											<tr>
												<td>item_quantity_#</td>
												<td>The quantity of items bought.</td>
												<td>Yes</td>
											</tr>
											<tr>
												<td>item_number_#</td>
												<td>This is a passthru variable for your own use. [visible to buyer]</td>
												<td>No</td>
											</tr>
											<tr>
												<td>item_on1_#</td>
												<td>1st option name. This lets you pass through a buyer option like size or color.</td>
												<td>No
												<br>(unless ov1 set)</td>
											</tr>
											<tr>
												<td>item_ov1_#</td>
												<td>1st option value. This would be the buyer's selection such as small, large, red, white.</td>
												<td>No</td>
											</tr>
											<tr>
												<td>item_on2_#</td>
												<td>2nd option name. This lets you pass through a buyer option like size or color.</td>
												<td>No
												<br>(unless ov2 set)</td>
											</tr>
											<tr>
												<td>item_ov2_#</td>
												<td>2nd option value. This would be the buyer's selection such as small, large, red, white.</td>
												<td>No</td>
											</tr>
											<tr>
												<td>invoice</td>
												<td>This is a passthru variable for your own use. [not visible to buyer]</td>
												<td>No</td>
											</tr>
											<tr>
												<td>custom</td>
												<td>This is a passthru variable for your own use. [not visible to buyer]</td>
												<td>No</td>
											</tr>
											<tr>
												<td>extra</td>
												<td>A note from the buyer.</td>
												<td>No</td>
											</tr>
											<tr>
												<td>send_tx</td>
												<td>The TX ID of the payment to the merchant. Only included when 'status' &gt;= 100 and if the payment mode is set to ASAP or Nightly or if the payment is PayPal Passthru.</td>
												<td>No</td>
											</tr>
											<tr>
												<td>received_amount</td>
												<td>The amount of currency2 received at the time the IPN was generated.</td>
												<td>No</td>
											</tr>
											<tr>
												<td>received_confirms</td>
												<td>The number of confirms of 'received_amount' at the time the IPN was generated.</td>
												<td>No</td>
											</tr>
											<tr>
												<th colspan="3" class="text-center">Donation Button Fields (ipn_type = 'donation')</th>
											</tr>
											<tr>
												<td>status</td>
												<td>The status of the payment. See Payment Statuses for details.</td>
												<td>Yes</td>
											</tr>
											<tr>
												<td>status_text</td>
												<td>A text string describing the status of the payment. (useful for displaying in order comments)</td>
												<td>Yes</td>
											</tr>
											<tr>
												<td>txn_id</td>
												<td>The unique ID of the payment.
												<br>Your IPN handler should be able to handle a txn_id composed of any combination of a-z, A-Z, 0-9, and - up to 128 characters long for future proofing.</td>
												<td>Yes</td>
											</tr>
											<tr>
												<td>currency1</td>
												<td>The original currency/coin submitted in your button.
												<br>Note: Make sure you check this!</td>
												<td>Yes</td>
											</tr>
											<tr>
												<td>currency2</td>
												<td>The coin the donator chose to pay with.</td>
												<td>Yes</td>
											</tr>
											<tr>
												<td>amount1</td>
												<td>The total amount of the payment in your original currency/coin.</td>
												<td>Yes</td>
											</tr>
											<tr>
												<td>amount2</td>
												<td>The total amount of the payment in the donator's selected coin.</td>
												<td>Yes</td>
											</tr>
											<tr>
												<td>subtotal</td>
												<td>The subtotal of the order before shipping and tax in your original currency/coin.</td>
												<td>Yes</td>
											</tr>
											<tr>
												<td>shipping</td>
												<td>The shipping charged on the order in your original currency/coin.</td>
												<td>Yes</td>
											</tr>
											<tr>
												<td>tax</td>
												<td>The tax on the order in your original currency/coin.</td>
												<td>Yes</td>
											</tr>
											<tr>
												<td>fee</td>
												<td>The fee on the payment in the donator's selected coin.</td>
												<td>Yes</td>
											</tr>
											<tr>
												<td>net</td>
												<td>The net amount you received of the buyer's selected coin after our fee and any coin TX fees to send the coins to you.</td>
												<td>Yes</td>
											</tr>
											<tr>
												<td>item_name</td>
												<td>The name of the donation.</td>
												<td>Yes</td>
											</tr>
											<tr>
												<td>item_number</td>
												<td>This is a passthru variable for your own use. [not visible to donator]</td>
												<td>No</td>
											</tr>
											<tr>
												<td>invoice</td>
												<td>This is a passthru variable for your own use. [not visible to donator]</td>
												<td>No</td>
											</tr>
											<tr>
												<td>custom</td>
												<td>This is a passthru variable for your own use. [not visible to donator]</td>
												<td>No</td>
											</tr>
											<tr>
												<td>on1</td>
												<td>1st option name. This lets you pass through a donator option like size or color.</td>
												<td>No
												<br>(unless ov1 set)</td>
											</tr>
											<tr>
												<td>ov1</td>
												<td>1st option value. This would be the donator's selection such as small, large, red, white.</td>
												<td>No</td>
											</tr>
											<tr>
												<td>on2</td>
												<td>2nd option name. This lets you pass through a donator option like size or color.</td>
												<td>No
												<br>(unless ov2 set)</td>
											</tr>
											<tr>
												<td>ov2</td>
												<td>2nd option value. This would be the donator's selection such as small, large, red, white.</td>
												<td>No</td>
											</tr>
											<tr>
												<td>extra</td>
												<td>A note from the donator.</td>
												<td>No</td>
											</tr>
											<tr>
												<td>send_tx</td>
												<td>The TX ID of the payment to the merchant. Only included when 'status' &gt;= 100 and if the payment mode is set to ASAP or Nightly or if the payment is PayPal Passthru.</td>
												<td>No</td>
											</tr>
											<tr>
												<td>received_amount</td>
												<td>The amount of currency2 received at the time the IPN was generated.</td>
												<td>No</td>
											</tr>
											<tr>
												<td>received_confirms</td>
												<td>The number of confirms of 'received_amount' at the time the IPN was generated.</td>
												<td>No</td>
											</tr>
											<tr>
												<th colspan="3" class="text-center">API Generated Transaction Fields (ipn_type = 'api')</th>
											</tr>
											<tr>
												<td>status</td>
												<td>The status of the payment. See Payment Statuses for details.</td>
												<td>Yes</td>
											</tr>
											<tr>
												<td>status_text</td>
												<td>A text string describing the status of the payment. (useful for displaying in order comments)</td>
												<td>Yes</td>
											</tr>
											<tr>
												<td>txn_id</td>
												<td>The unique ID of the payment.
												<br>Your IPN handler should be able to handle a txn_id composed of any combination of a-z, A-Z, 0-9, and - up to 128 characters long for future proofing.</td>
												<td>Yes</td>
											</tr>
											<tr>
												<td>currency1</td>
												<td>The original currency/coin submitted.</td>
												<td>Yes</td>
											</tr>
											<tr>
												<td>currency2</td>
												<td>The coin the buyer paid with.</td>
												<td>Yes</td>
											</tr>
											<tr>
												<td>amount1</td>
												<td>The amount of the payment in your original currency/coin.</td>
												<td>Yes</td>
											</tr>
											<tr>
												<td>amount2</td>
												<td>The amount of the payment in the buyer's coin.</td>
												<td>Yes</td>
											</tr>
											<tr>
												<td>fee</td>
												<td>The fee on the payment in the buyer's selected coin.</td>
												<td>Yes</td>
											</tr>
											<tr>
												<td>buyer_name</td>
												<td>The name of the buyer.</td>
												<td>No</td>
											</tr>
											<tr>
												<td>email</td>
												<td>Buyer's email address.</td>
												<td>No</td>
											</tr>
											<tr>
												<td>item_name</td>
												<td>The name of the item that was purchased.</td>
												<td>No</td>
											</tr>
											<tr>
												<td>item_number</td>
												<td>This is a passthru variable for your own use.</td>
												<td>No</td>
											</tr>
											<tr>
												<td>invoice</td>
												<td>This is a passthru variable for your own use.</td>
												<td>No</td>
											</tr>
											<tr>
												<td>custom</td>
												<td>This is a passthru variable for your own use.</td>
												<td>No</td>
											</tr>
											<tr>
												<td>send_tx</td>
												<td>The TX ID of the payment to the merchant. Only included when 'status' &gt;= 100 and if the payment mode is set to ASAP or Nightly or if the payment is PayPal Passthru.</td>
												<td>No</td>
											</tr>
											<tr>
												<td>received_amount</td>
												<td>The amount of currency2 received at the time the IPN was generated.</td>
												<td>No</td>
											</tr>
											<tr>
												<td>received_confirms</td>
												<td>The number of confirms of 'received_amount' at the time the IPN was generated.</td>
												<td>No</td>
											</tr>
										</tbody>
									</table>
								</div>
							</div>
						</div>
					</form>
				</div>
			</div>
		</div>
	</section>
</article>

          
        </div>

     </div>
  </div>
</section>

<script>

  $(document).ready(function(){

   $('.extras').click(function(){

    $('.profile-list').toggleClass('showing')

  });

   $('.more-menu-bottom').click(function(){

    $('.extra-menu-mobile').toggleClass('showall-extramenus')

  })

 })
  
</script>
</body>
</html>
