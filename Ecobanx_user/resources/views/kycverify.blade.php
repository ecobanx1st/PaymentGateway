@php $title = "KYC Verfication"; $atitle ="Kyc";
@endphp
@include('layouts.headercss')



<section class="Dashboard-page wallet-page-main">
	<div class="container-fluid">
		<div class="row">
			@include('layouts.menu')


			<div class="col-lg-10 col-xl-10 col-md-12 col-sm-12 col-xs-12">

				<div class="header-part-outer">
					<div class="common-header-style title-outer">
                  <div class="row">

                    <div class="col-lg-6 col-xl-6 col-md-6 col-sm-6 col-xs-6">
                      <div class="logo-payment"><a href="dashboard.html"><img src="{{ url('img/logo.png') }}" alt="logo"></a></div>
                    </div>

                    <div class="col-lg-6 col-xl-6 col-md-6 col-sm-6 col-xs-6">
                      <div class="notify-part">
                        <div class="notify"><img src="{{ url('img/Notification.png') }}"></div>
                        <div class="message"><img src="{{ url('img/message.png') }}"></div>
                      </div>
                    </div>

                  </div>
                </div>

					<div class="head-title-part">
						<h1>KYC Verification</h1>
					</div>

				</div>


				<div class="dashboard-body wallet-body">

					<div class="row">

						<div class="col-lg-12 col-xl-12 col-md-12 col-sm-12 col-xs-12">
							<div class="deposit-card">
								<!-- replace with https://api.sumsub.com/idensic/static/sumsub-kyc.js when going live -->
						        <!-- <script src="https://test-api.sumsub.com/idensic/static/sumsub-kyc.js"></script> -->
						        <script src="https://api.sumsub.com/idensic/static/sumsub-kyc.js"></script>
						        <div id="idensic"></div>
						        <div class="col-md-12 text-center" id="skipbtn">
						        <a href="{{url('/profile')}}" class="btn next_l action-button yellowbtn" >Skip</a>
						        </div>


							</div>
						</div>
					</div>

				</div>

			</div>

		</div>
	</div>
</section>

@php
$accessToken = $token['token'];
$userId = $token['userId'];
@endphp
<script type="text/javascript">
$( document ).ready(function() {
    document.getElementById('skipbtn').style.display = 'none';
});
</script>
<script>
  var id = idensic.init(
// selector of the WebSDK container (see above)
'#idensic',
// configuration object (see the settings in the demo)
{
// provide your clientId (shown in the demo in the top left corner)
clientId: 'wllxpay',
// access token generated for $YOUR_USER_ID
accessToken: "{{$accessToken}}",
// your user id for which you generated $ACCESS_TOKEN
externalUserId: "{{$userId}}"
},
// function for the WebSDK callbacks
function(messageType, payload) {
// e.g. just logging the incoming messages
console.log('[IDENSIC DEMO] Idensic message:', messageType, payload);
console.log("Vinoth",payload);
console.log("Vinoth cc",messageType);
if(messageType == 'idCheck.onApplicantLoaded'){
    if(payload.applicantId){
            $.ajax({
                headers: {
                    'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
                },
                type: "POST",
                url: '{{url("/ajaxkyc")}}',
                data: 'data='+payload.applicantId
            });
    }
}

if(messageType == 'idCheck.applicantStatus'){
    if(payload.reviewStatus == 'pending'){
    document.getElementById('skipbtn').style.display = 'block';
    setTimeout(function(){
      window.location.href = '{{url("/profile")}}';
    }, 8000)

    }
}
}
)
</script>


</body>
</html>
