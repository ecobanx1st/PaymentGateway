@php $title = "Donation HTML POST Field"; $atitle ="merchant";
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
                  <h1>Donation HTML POST Fields</h1>
                  <!-- <p>We are on a mission to help developers like you to build beautiful projects for free.</p> -->
                </div>

              </div>

			  <article class="inner-banner">
	<section class="loginbg inner-banner-ht buttonmaker">
		<div class="container">
			<div class="col-md-12 col-sm-12 col-xs-12 center-content securitybox">
				<!-- <h3 class="text-center fnt-bld inner-heading">Simple HTML POST Fields</h3> -->
				<div class="form-container">
					<form action='#' method='post' enctype='multipart/form-data'>
					<div class="alert alert-info">
       					 <i class="fa fa-info-circle"></i> Note: The system will only let you have 3 transactions at a time in the 'Waiting for funds...' state (as a buyer, no limit for sellers)
      				</div>
					<h4 class="subt text-center pb-30">If you need a checkout with more options such as buyer selectable quantity, multiple item shipping, etc. check out our <a href="{{ route('buttonmaker') }}" class="alinktext">Advanced Button</a>.</h4>	
						<div class="table-responsive" data-simplebar>
							<table class="table table-small-font no-mb table-borderded">
            <thead>
              <tr>
                <th>Field Name</th>
                <th class="text-center">Description</th>
                <th>Required?</th>
                <th>Length Limit</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <th class="text-center" colspan="4">Main Fields</th>
              </tr>
              <tr>
                <td>cmd</td>
                <td>This should always be set to '_donation'.</td>
                <td>Yes</td>
                <td>N/A</td>
              </tr>
              <tr>
                <td>reset</td>
                <td>This tells the server to delete any cached button data for the user. Set the value to 1</td>
                <td>Yes</td>
                <td>1</td>
              </tr>
              <tr>
                <td>merchant</td>
                <td>Your merchant ID (you can find this on the My Account page).</td>
                <td>Yes</td>
                <td>N/A</td>
              </tr>
              <tr>
                <th colspan="4" class="text-center">Item/Payment Description Fields</th>
              </tr>
              <tr>
                <td>currency</td>
                <td>The currency of the payment (BTC, ETH, BCH, USDT, USDC &amp; EURST).
                  Values supported: Any crypto or fiat currency on the Supported Coins page.
                Note we in no way process any fiat currencies, they are simply convenience values so you don't have to convert to BTC or another coin yourself.</td>
                <td>Yes</td>
                <td>5</td>
              </tr>
              <tr>
                <td>amount</td>
                <td>The amount (in the currency chosen) of the payment.</td>
                <td>Yes</td>
                <td>N/A</td>
              </tr>
              <tr>
                <td>item_name</td>
                <td>The name of the item being purchased.</td>
                <td>Yes</td>
                <td>128</td>
              </tr>
              <tr>
                <td>item_desc</td>
                <td>Description of the item being purchased.</td>
                <td>No</td>
                <td>128</td>
              </tr>
              <tr>
                <td>item_number</td>
                <td>This is a passthru variable for your own use. [not visible to buyer]</td>
                <td>No</td>
                <td>128</td>
              </tr>
              <tr>
                <td>invoice</td>
                <td>This is a passthru variable for your own use. [not visible to buyer]</td>
                <td>No</td>
                <td>128</td>
              </tr>
              <tr>
                <td>allow_quantity</td>
                <td>0 = Don't allow buyer to adjust quantity (default).<br> 1 = Allow buyer to adjust quantity.</td>
                <td>No</td>
                <td>1</td>
              </tr>
              <tr>
                <th class="text-center" colspan="4">Shipping Fields</th>
              </tr>
              <tr>
                <td>want_shipping</td>
                <td>1 = Want buyer's shipping information.0 = Don't want buyer's shipping information. (default)</td>
                <td>No</td>
                <td>1</td>
              </tr>
              <tr>
                <td>shippingf</td>
                <td>Cost of shipping the item.<br>Shipping cost is shippingf*quantity (unless shipping2 is set)</td>
                <td>No</td>
                <td>N/A</td>
              </tr>
              <tr>
                <th class="text-center" colspan="4">Miscellaneous Fields</th>
              </tr>
              <tr>
                <td>ipn_url</td>
                <td>Sets an IPN URL.If not set or blank defaults to the IPN URL in your settings.</td>
                <td>No</td>
                <td>255</td>
              </tr>
              <tr>
                <td>success_url</td>
                <td>Sets a URL to go to if the buyer does complete checkout.</td>
                <td>No</td>
                <td>255</td>
              </tr>
              <tr>
                <td>cancel_url</td>
                <td>Sets a URL to go to if the buyer decides to not complete checkout.</td>
                <td>No</td>
                <td>255</td>
              </tr>
              <tr>
                <td>lang</td>
                <td>Automatically set the checkout language to this language code. For a list of supported codes check this page.</td>
                <td>No</td>
                <td>16</td>
              </tr>
              <tr>
                <th class="text-center" colspan="4">Buyer Information. These fields can be used to pre-populate forms with any information you already know about your buyer.</th>
              </tr>
              <tr>
                <td>first_name</td>
                <td>Buyer's first name.</td>
                <td>No</td>
                <td>32</td>
              </tr>
              <tr>
                <td>last_name</td>
                <td>Buyer's last name.</td>
                <td>No</td>
                <td>32</td>
              </tr>
              <tr>
                <td>email</td>
                <td>Buyer's email address.</td>
                <td>No</td>
                <td>128</td>
              </tr>
              <tr>
                <td>address1</td>
                <td>Street / address line 1</td>
                <td>No</td>
                <td>128</td>
              </tr>
              <tr>
                <td>city</td>
                <td>City</td>
                <td>No</td>
                <td>64</td>
              </tr>
                <tr>
                  <td>phone</td>
                  <td>Phone Number</td>
                  <td>No</td>
                  <td>32</td>
                </tr> 
              </tbody>
              <tfoot>
                <tr>
                  <td colspan="4" class="text-center">Feel free to check out our <a href="{{ route('donationbuttonExample') }}" class="alinktext">example buttons</a>.</td>
                </tr>
              </tfoot>
            </table>
						</div>
					</form>
					<div class="text-center">
          				<a href="{{ route('merchanttools') }}" class="text-center btn sitebtn"><i class="fa fa-arrow-left"></i> Back to Merchant Tool</a>
        			</div>
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