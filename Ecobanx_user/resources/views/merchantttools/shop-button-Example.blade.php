@php $title = "Shop Button Examples"; $atitle ="merchant";
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
                  <h1>Example buttons</h1>
                  <!-- <p>We are on a mission to help developers like you to build beautiful projects for free.</p> -->
                </div>

              </div>

			  <article class="inner-banner">
	<section class="loginbg inner-banner-ht buttonmaker">
		<div class="container">
			<div class="col-md-12 col-sm-12 col-xs-12 center-content securitybox">
				<!-- <h3 class="text-center fnt-bld inner-heading">Example buttons</h3> -->
				<!-- <h4 class="subt text-center pb-30">If you need a checkout with more options such as buyer selectable quantity, multiple item shipping, etc.</h4>	 -->
				<div class="form-container buttonmaker">
					<div class="examplecodebg">
						<h4 class="subt-t fnt-reg pb-20">Advanced Button</h4>
						<textarea rows="18" class="form-control">
                            <form action="{{ url('/makepayment') }}" method="post">
                              <input type="hidden" name="cmd" value="_pay_simple">
                              <input type="hidden" name="reset" value="1">
                              <input type="hidden" name="merchant" value="{{$merchant}}">
                              <input type="hidden" name="item_name" value="xxxxxxxxxxxx">
                              <input type="hidden" name="item_desc" value="xxxxxxxxxxxx">
                              <input type="hidden" name="item_number" value="123456789">
                              <input type="hidden" name="invoice" value="123456789">
                              <input type="hidden" name="quantity" value="1">
                              <input type="hidden" name="update_quantity" value="0">
                              <input type="hidden" name="currency" value="BTC">
                              <input type="hidden" name="amount" value="10.00000000">
                              <input type="hidden" name="want_shipping" value="0">
                              <input type="hidden" name="shipping_cost" value="0.00000000">
                              <input type="hidden" name="shipping_cost_additional" value="0.00000000">
                              <input type="hidden" name="success_url" value="https://....">
                              <input type="hidden" name="cancel_url" value="https://....">
                              <input type="hidden" name="ipn_url" value="https://....">
                              <input type="hidden" name="buyer_leave_msg" value="0">
                              <input type="image" src="" alt="">
                            </form>
						</textarea>
						<div class="buttonlogo mt-20">
							<img src="{{ url('img/paymentlogo.svg') }}" border="0">
						</div>
					</div>

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