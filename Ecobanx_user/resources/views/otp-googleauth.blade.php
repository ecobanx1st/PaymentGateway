@php 
$title = "OTP Page";
@endphp
@extends('layouts.app')

@section('content')
<style type="text/css">
	input {
	    margin: 10px;
	    height: 40px;
	    width: 65px;
	    border: none;
	    border-radius: 5px;
	    font-size: 1.2rem;
	    background: #eef2f3;
	}
</style>
<section class="sign-in-page otp success-page">
	<div class="container-fluid">
		<div class="row">
			<div class="col-lg-12 col-xl-12 col-md-12 col-sm-12 col-xs-12 my-auto bg-img">
				<div class="loginouterbox">
					<div class="login-form">
						<div class="logo">
							<img src="{{ url('/img/sign-in-logo.png') }}" alt="" class="img-fluid" >
						</div>
						@if(isset($image))
						<div class="succes-icon">
							<span>{{ $image }}</span>
						</div>
						<h4 class="heading-title">Secret Code  : {{ $secret }}</h4>
						<p class="para-title">Install Google Authenticator app in Your mobile and scan QR code in google verification code</p>
						@else
						<div class="succes-icon">
							<img src="{{ url('/img/profile-Image.png') }}" alt="" >
						</div>
						<h4 class="heading-title">Hi ! {{ Auth::user()->name }}</h4>
						<p class="para-title">Enter your one time password  to access </p>
						@endif
						<div class="formcontentbox">
							<div class="mlmwizardform">
								@if (session('status'))
								<div class="alert alert-success">
									{{ session('status') }}
								</div>
								@endif
								@if (session('error'))
								<div class="alert alert-warning">
									<?php echo session('error'); ?>
								</div>
								@endif
								<form id="ms-login-form" class="siteformbg" action="{{ route('verifygoogleauth') }}" method="POST" autocomplete="off">
									{{ csrf_field() }}   
									<div class="form-card">
										<h5 class="enter-otp">Enter OTP</h5>
										<input type="hidden" id="otpcode" name="code">

										<div class="userInput otp-field">
											<input type="text" id='ist' maxlength="1" onkeyup="clickEvent(this,'sec')">
											<input type="text" id="sec" maxlength="1" onkeyup="clickEvent(this,'third')">
											<input type="text" id="third" maxlength="1" onkeyup="clickEvent(this,'fourth')">
											<input type="text" id="fourth" maxlength="1" onkeyup="clickEvent(this,'fifth')">
											<input type="text" id="fifth" maxlength="1" onkeyup="clickEvent(this,'sixth')">
											<input type="text" id="sixth" maxlength="1">
										</div>
											
										<div class="formcontentbox">
											<input type="submit" name="" id="submit" class="tn next_l action-button yellowbtn" value="Verify">
										</div>
									</div>

								</form>
							</div>
						</div>
					</div>
				</div>
			</div>

			<!-- <div class="col-lg-6 col-xl-6 col-md-12 col-sm-12 col-xs-12">
				<div class="signin-right-side-img otp">
					 <img src="{{ url('/img/otp-pageright-img.png') }}" alt="" class="img-fluid"> 
				</div>
			</div> -->

		</div>
	</div>
</section>
<script src="https://cdnjs.cloudflare.com/ajax/libs/jquery/3.7.0/jquery.min.js" integrity="sha512-3gJwYpMe3QewGELv8k/BX9vcqhryRdzRMxVfq6ngyWXwo03GFEzjsUm8Q7RZcHPHksttq7/GFoxjCVUjkjvPdw==" crossorigin="anonymous" referrerpolicy="no-referrer"></script>

<script>
	function clickEvent(first,last){
		if(first.value.length){
			document.getElementById(last).focus();
		}
	}
	const inputs = document.querySelectorAll(".otp-field input");
	    $('#submit').attr('disabled', 'disabled');



inputs.forEach((input, index) => {
    input.dataset.index = index;
    input.addEventListener("keyup", handleOtp);
    input.addEventListener("paste", handleOnPasteOtp);
});

function handleOtp(e) {
    const input = e.target;
    let value = input.value;
    let isValidInput = value.match(/[0-9a-z]/gi);
    input.value = "";
    input.value = isValidInput ? value[0] : "";

    let fieldIndex = input.dataset.index;
    if (fieldIndex < inputs.length - 1 && isValidInput) {
        input.nextElementSibling.focus();
    }

    if (e.key === "Backspace" && fieldIndex > 0) {
        input.previousElementSibling.focus();
    }

    if (fieldIndex == inputs.length - 1 && isValidInput) {
        submit();
    }
}

function handleOnPasteOtp(e) {
    const data = e.clipboardData.getData("text");

    const value = data.split("");
    if (value.length === inputs.length) {
        inputs.forEach((input, index) => (input.value = value[index]));
        submit();
    }
}

function submit() {
    console.log("Submitting...");
    // 👇 Entered OTP
    let otp = "";
    inputs.forEach((input) => {
        otp += input.value;
        input.disabled = true;
        input.classList.add("disabled");
    });
    document.getElementById("otpcode").value=otp;
    $('#submit').removeAttr('disabled');
  }
</script>


@endsection
