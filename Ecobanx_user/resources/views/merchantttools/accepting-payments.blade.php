@include('inc.home-header')
</section>
<div class="inner-header">

  @include('inc.menu')
</div>
</header>
<article class="inner-banner">
	<section class="loginbg inner-banner-ht buttonmaker">
		<div class="container apicointainer">
			<div class="col-md-12 col-sm-12 col-xs-12 center-content securitybox">
				<h3 class="text-center fnt-bld inner-heading">Accepting Payments with the paymentgatewaydemo API</h3>
				<hr class="x-linef">
				<br/>
				<div class="form-container">
					<div class="examplecodebg">					
						<div class="apiflexbox">					
							<div class="col-md-3 col-sm-4 col-xs-12 apiciontenttext">
								@include('inc.payment-list')
							</div>
							<div class="col-md-9 col-sm-8 col-xs-12 apicontentf">
								<h4 class="subt-t fnt-reg">There are 2 ways to accept payments with the paymentgatewaydemo API</h4>
								<p class="content"><a href="#" class="alinktext">'create_transaction'</a> - Fixed-price Payments (most popular): You specify a price in fiat or cryptocurrency and what type of coin to receive. The buyer has to send the amount of coin returned by the API in order for the transaction to go through; if you want to receive for example $100 USD worth of Bitcoin for a client's order this is the choice for you. Fixed-price payments also have a multitude of payout options from storing in your paymentgatewaydemo Wallet, forwarding to another crypto wallet, converting to another coin, or settling in fiat currency.</p>
								<p class="content"><a href="#" class="alinktext">'get_callback_address'</a> - Variable Payments: Gives you an address, any coins received by it are deposited into your paymentgatewaydemo Wallet and if you have an IPN URL set will notify your server of the payment. The buyer can send any amount of coins as many times as they want; if you want to assign a client an address they can use to "top up" any time this is the choice for you.</p>
								
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	</section>
</article>

@include('inc.home-footer')
@include('inc.customscript')
</body>
</html>