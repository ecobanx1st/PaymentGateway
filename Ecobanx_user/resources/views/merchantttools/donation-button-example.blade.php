@php $title = "Donation Button Example"; $atitle ="merchant";
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
                                <div class="logo-payment"><a href="dashboard.html"><img src="img/logo.png"
                                            alt="logo"></a></div>
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
                        <h1>Donation Button Example</h1>
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
                                        <h4 class="subt-t fnt-reg pb-20">Minimal Button</h4>
                                        <textarea rows="10" class="form-control">
							<form action="{{ url('/makepayment') }}" method="post">
								<input type="hidden" name="cmd" value="_donate">
								<input type="hidden" name="reset" value="1">
								<input type="hidden" name="merchant" value="{{$merchant}}">
								<input type="hidden" name="currency" value="ETH">
								<input type="hidden" name="amount" value="10.00000000">
								<input type="hidden" name="item_name" value="Test Item">
								<input type="hidden" name="want_shipping" value="0">
								<input type="image" src="{{ url('img/paymentlogo.svg') }}" alt="Donate with EcoBanx">
							</form>
						</textarea>
                                        <div class="buttonlogo mt-20">
                                            <img src="{{ url('img/paymentlogo.svg') }}" border="0">
                                        </div>
                                    </div>

                                    <div class="examplecodebg">
                                        <h4 class="subt-t fnt-reg pb-20">Button with Item Description</h4>
                                        <textarea rows="18" class="form-control">
							<form action="{{ url('/makepayment') }}" method="post">
								<input type="hidden" name="cmd" value="_donate">
								<input type="hidden" name="reset" value="1">
								<input type="hidden" name="merchant" value="{{$merchant}}">
								<input type="hidden" name="item_name" value="">
								<input type="hidden" name="item_desc" value="">
								<input type="hidden" name="item_number" value="">
								<input type="hidden" name="invoice" value="">
								<input type="hidden" name="currency" value="USD">
								<input type="hidden" name="want_shipping" value="0">
								<input type="hidden" name="amount" value="10.00000000">
								<input type="hidden" name="want_shipping" value="0">
								<input type="hidden" name="success_url" value="">
								<input type="hidden" name="cancel_url" value="">
								<input type="hidden" name="ipn_url" value="">
								<input type="image" src="{{ url('img/paymentlogo.svg') }}" alt="Donate with EcoBanx">
							</form>
						</textarea>
                                        <div class="buttonlogo mt-20">
                                            <img src="{{ url('img/paymentlogo.svg') }}" border="0">
                                        </div>
                                    </div>
                                    <div class="text-center">
                                        <a href="{{ route('merchanttools') }}" class="text-center btn sitebtn"><i
                                                class="fa fa-arrow-left"></i> Back to Merchant Tool</a>
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
function myFunction() {
    var copyText = document.getElementById("myInput");
    copyText.select();
    document.execCommand("copy");

    var tooltip = document.getElementById("myTooltip");
    tooltip.innerHTML = "Copied";
}
</script>

<script>
$(document).ready(function() {

    $('.extras').click(function() {

        $('.profile-list').toggleClass('showing')

    });

    $('.more-menu-bottom').click(function() {

        $('.extra-menu-mobile').toggleClass('showall-extramenus')

    })

})
</script>

</body>

</html>