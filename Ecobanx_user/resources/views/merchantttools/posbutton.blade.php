@php $title = "Pos Button"; $atitle ="merchant";
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
                  <h1>POS Button</h1>
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
                                    <th>Item</th>
                                    <th>Value</th>
                                    <th>Required?</th>
                                  </tr>
                                </thead>
                                <tbody>
              <tr>
                <td>Merchant ID <span class="text-danger">*</span></td>
                <td>
                  <input type="hidden" id="data_url" value="https://kryptonica.net/makePosButton">
                  <input value="a133a4b4474c84d5043e6cf97103b28e" class="form-control" readonly="" fdprocessedid="qa22lg">
                  </td><td class="text-center">Yes</td>
                
              </tr>
              <tr>
                <td>Payment Description <span class="text-danger">*</span></td>
                <td class="">
                  <input name="item_name" class="form-control allletterwithspace" value="Order Payment" fdprocessedid="frlf1">
                                  </td>
                <td class="text-center">Yes</td>
              </tr>
              <tr>
                <td>Initial Amount <span class="text-danger">*</span></td>
                <td class="slectinputbox ">
                  <input name="item_amount" value="0.1" class="form-control allownumericwithdecimal" id="item_amount" fdprocessedid="v100i">
                  <span class="selectrightbox">
                    <select class="form-control" name="paymentcurrency" >
                      <option value="BTC">BTC</option>
                      <option value="ETH">ETH</option>
                      <option value="USDT">USDT</option>
                      <option value="USDC">USDC</option>
                    </select>
                  </span>
                                  </td>
                <td style="text-align:center">No</td>
              </tr>
              <tr>
                <td>Allow to Change Currency </td>
                <td class="">
                  <label class="checkcont">
                    <input name="update_currency" id="update_currency" type="checkbox"> <span class="checkmark"></span></label>
                                      </td>
                  <td style="text-align:center">No</td>
                </tr>
                <tr>
                  <td colspan="3" align="center">
                    <div id="showError" class="text-danger"></div>
                    <button type="button" id="generate_btn" class="btn sitebtn mb-20 mt-20" fdprocessedid="mbtyy">Generate Button</button>
                  </td>
                </tr>
              </tbody>
              <tfoot>
                  <tr>
                    <td colspan="3">For a full list of fields and detailed information please check out the <a href="{{ route('merchanttoolssimple') }}" class="alink">HTML POST Fields</a> page.</td>
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