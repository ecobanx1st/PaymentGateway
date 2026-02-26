@php $title = "Pos Html Fields"; $atitle ="merchant";
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
                  <h1>POS HTML POST Fields</h1>
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
                                        <td>This should always be set to '_pos'.</td>
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
                                        <td>The currency of the payment (BTC, ETH and etc).
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
                                        <th class="text-center" colspan="4">Optional/Informational Fields</th>
                                    </tr>
                                    <tr>
                                        <td>allow_amount</td>
                                        <td>1 = Allow buyer to adjust item price. (default)<br>0 = Don't allow buyer to adjust item price.</td>
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
                                        <td>custom</td>
                                        <td>This is a 2nd passthru variable for your own use. [not visible to buyer]  </td>
                                        <td>No</td>
                                        <td>1</td>
                                    </tr>
                                    <tr>
                                        <td>allow_currency</td>
                                        <td>0 = Don't allow buyer to adjust source currency (default).<br>1 = Allow buyer to adjust source currency.</td>
                                        <td>No</td>
                                        <td>255</td>
                                    </tr>
                                    <tr>
                                        <td>allow_currencies</td>
                                        <td>Currency codes separated with a comma of coins you will accept. This is used to further restrict the coin selection from your list of enabled coins; for example if you are doing your own exchange rates and want to limit checkout to a user selected currency.</td>
                                        <td>No</td>
                                        <td>255</td>
                                    </tr>
                                    <tr>
                                        <td>ipn_url</td>
                                        <td>Sets an IPN URL.<br>If not set or blank defaults to the IPN URL in your settings. </td>
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
                                        <td>cstyle</td>
                                        <td>Automatically set the checkout language to this language code. For a list of supported codes check this page.</td>
                                        <td>No</td>
                                        <td>16</td>
                                    </tr>
                                    <tr>
                                        <th class="text-center" colspan="4">Miscellaneous Fields</th>
                                    </tr>
                                    <tr>
                                        <td>ipn_url</td>
                                        <td>Sets a coin selection style for the checkout page. (default: grid1)<br>Warning: Other styles may not look right, they are untested</td>
                                        <td>No</td>
                                        <td>32</td>
                                    </tr>
                                    <tr>
                                        <th class="text-center" colspan="4">Buyer Information. These fields can be used to pre-populate forms with any information you already know about your buyer.</th>
                                    </tr>
                                    <tr>
                                        <td>email</td>
                                        <td>Buyer's email address.</td>
                                        <td>No</td>
                                        <td>128</td>
                                    </tr>
                                    </tbody>
								<tfoot>
									<tr>
										<td colspan="4" class="text-center">Feel free to check out our <a href="{{ route('examplebuttons') }}" class="alinktext">example buttons</a>.</td>
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