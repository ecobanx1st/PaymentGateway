@php
$title = "Sign Up";
@endphp
@extends('layouts.app')

@section('content')
<section class="sign-up-page bg-img">
    <div class="container-fluid for-register">
        <div class="row">


            <div class="col-lg-12 col-xl-12 col-md-12 col-sm-12 col-xs-12  bg-img right-side">
                <div class="loginouterbox a3">
                    <div class="login-form">
                        <div class="logo">
                            <a href="{{ url('/') }}">
                                <img src="{{ url('img/sign-in-logo.png') }}" alt="" class="img-fluid">
                            </a>
                        </div>

                        <h4 class="heading-title">Sign Up</h4>

                        <div class="sign-up-container" style="color:red">
                            @if ($message = Session::get('error'))
                            <div class="alert alert-danger alert-block" style="color:red">
                                <strong style="color:red">{{ $message }}</strong>
                            </div>
                            @endif


                            @if ($message = Session::get('status'))
                            <div class="alert alert-success alert-block">
                                <strong><?php    echo $message;?></strong>
                            </div>
                            @endif
                            @if($errors->any())
                            {!! implode('', $errors->all('<div>:message</div>')) !!}
                            @endif
                            <form method="POST" action="{{ route('register') }}">
                                @csrf
                                <p class="para-title">Choose Account Type</p>
                                <select name="account" id="account">
                                    <!-- <option value="Type">Choose Account Type</option> -->
                                    <option value="Personal" @if(old('account')=='Personal' ) selected @endif>
                                        Individual/Freelance
                                        Account</option>
                                    <option value="Business" @if(old('account')=='Business' ) selected @endif>
                                        Business Account</option>
                                </select>
                                @error('account')
                                <span class="invalid-feedback" role="alert">
                                    <strong>{{ $message }}</strong>
                                </span>
                                @enderror

                                <div class="user_details" id="personal-detail" @if(old('account')=='Business' )
                                    style="display:none" @endif>
                                    <div class="input_pox">
                                        <span class="datails">First Name</span>
                                        <input id="first_name" type="text"
                                            class="form-control @error('first_name') is-invalid @enderror"
                                            name="first_name" value="{{ old('first_name') }}" autocomplete="name"
                                            autofocus>
                                        @error('first_name')
                                        <span class="invalid-feedback" role="alert">
                                            <strong>{{ $message }}</strong>
                                        </span>
                                        @enderror
                                    </div>
                                    <div class="input_pox">
                                        <span class="datails">Last Name</span>
                                        <input id="last_name" type="text"
                                            class="form-control @error('last_name') is-invalid @enderror"
                                            name="last_name" value="{{ old('last_name') }}" autocomplete="last_name"
                                            autofocus>
                                        @error('last_name')
                                        <span class="invalid-feedback" role="alert">
                                            <strong>{{ $message }}</strong>
                                        </span>
                                        @enderror
                                    </div>
                                </div>
                                <div class="user_details" id="business-detail" @if(old('account') !='Business' )
                                    style="display:none" @endif>
                                    <div class="input_pox">
                                        <span class="datails">Legal Business Name</span>
                                        <input id="business_name" type="text"
                                            class="form-control @error('business_name') is-invalid @enderror"
                                            name="business_name" value="{{ old('business_name') }}"
                                            autocomplete="business_name" autofocus>
                                        @error('business_name')
                                        <span class="invalid-feedback" role="alert">
                                            <strong>{{ $message }}</strong>
                                        </span>
                                        @enderror
                                    </div>
                                    <div class="input_pox">
                                        <span class="datails">Company Website</span>
                                        <input id="company_website" type="text"
                                            class="form-control @error('company_website') is-invalid @enderror"
                                            name="company_website" value="{{ old('company_website') }}"
                                            autocomplete="company_website" autofocus>
                                        @error('company_website')
                                        <span class="invalid-feedback" role="alert">
                                            <strong>{{ $message }}</strong>
                                        </span>
                                        @enderror
                                    </div>
                                </div>
                                <fieldset>
                                    <div class="form-card">
                                        <div class="form-group ">
                                            <label>Email Address<span class="text text-danger">*</span></label>
                                            <input id="email" type="email"
                                                class="form-control @error('email') is-invalid @enderror" name="email"
                                                value="{{ old('email') }}" required autocomplete="email" autofocus>
                                            @error('email')
                                            <span class="text-danger errors-text show_error_email" role="alert">
                                                <strong>{{ $message }}</strong>
                                            </span><br />
                                            @enderror
                                        </div>

                                    </div>
                                </fieldset>
                                <div class="user_details">
                                    <div class="input_pox">
                                        <span class="datails">Password</span>
                                        <div class="input-group">
                                            <input type="password" class="form-control" name="password"
                                                class="form-control" value="{{ old('password') }}" id="password"
                                                required autocomplete="password" autofocus>
                                            <span class="input-group-text" id="passtexticon"
                                                onClick="getPasswordResponse()"><i class="fa fa-eye-slash"></i> </span>

                                        </div>
                                        @error('password')
                                        <span class="text-danger errors-text show_error_email" role="alert">
                                            <strong>{{ $message }}</strong>
                                        </span><br />
                                        @enderror
                                    </div>
                                    <div class="input_pox">
                                        <span class="datails">Confirm Password</span>
                                        <div class="input-group">
                                            <input type="password" class="form-control" name="password_confirmation"
                                                class="form-control" value="{{ old('password') }}" id="password-confirm"
                                                required autocomplete="new-password" autofocus>
                                            <span class="input-group-text" id="passtexticon"
                                                onClick="getPasswordConfirmResponse()"><i class="fa fa-eye-slash"></i>
                                            </span>

                                        </div>
                                        @error('password')
                                        <span class="text-danger errors-text show_error_email" role="alert">
                                            <strong>{{ $message }}</strong>
                                        </span><br />
                                        @enderror
                                    </div>
                                    <span class="noteshow">Your password must contain at least 8 characters, one
                                        uppercase (ex: A, B, C, etc), one lowercase letter, one numeric digit (ex: 1, 2,
                                        3, etc) and one special character (ex: @, #, $, etc)</span>
                                </div>
                                <div class="Remember">
                                    <input type="checkbox" value="lsRememberMe" id="rememberMe"> <label
                                        for="rememberMe">I agree with the terms of use</label><br />
                                </div>
                                <div class="">
                                   <div class="form-group text-center g-recaptcha-whl">
                                        {!! NoCaptcha::display() !!}

                                        @if ($errors->has('g-recaptcha-response'))
                                            <span class="text-danger errors-text show_error_password">
                                                <strong>{{ $errors->first('g-recaptcha-response') }}</strong>
                                            </span>
                                        @endif
                                        </div>
                                </div>
                                <div class="button">
                                    <button class="btn next_l action-button yellowbtn">{{ __('Register') }}</button>
                                </div>
                                <p class="para-title">Already have an account? <a href="{{ route('login') }}"
                                        class="t-blue"><span>Click here to Sign in.</span></a></p>


                        </div>
                        </form>
                    </div>
                </div>
{!! NoCaptcha::renderJs() !!}

                <div class="coprights-menu">
                    <ul>
                        <li>© Eco Banx 2026

                        </li>
                        <li><a href="#">Terms & Conditions</a></li>
                        <li><a href="#">Privacy Policy</a></li>
                        <li class="language-update">
                            <select class="language-select">
                                <option value="en">English</option>
                                <option value="cn">Russian</option>
                                <option value="es">Spanish</option>
                                <option value="it">Italian</option>
                                <option value="fr">French</option>
                                <option value="pt">Portuguese</option>
                                <option value="zn">Chinese</option>
                                <option value="bul">Bulgarian</option>
                            </select>
                        </li>
                    </ul>
                </div>

            </div>

        </div>
    </div>
</section>


<script src="https://cdnjs.cloudflare.com/ajax/libs/jquery/3.7.0/jquery.min.js"
    integrity="sha512-3gJwYpMe3QewGELv8k/BX9vcqhryRdzRMxVfq6ngyWXwo03GFEzjsUm8Q7RZcHPHksttq7/GFoxjCVUjkjvPdw=="
    crossorigin="anonymous" referrerpolicy="no-referrer"></script>
<script>
//password show/hide
function getPasswordResponse() {
    var password_repsonse = document.getElementById("password");
    if (password_repsonse.getAttribute('type') === "password") {
        password_repsonse.setAttribute('type', 'text');
        document.getElementById("passtexticon").innerHTML = '<i class="fa fa-eye" aria-hidden="true"></i>';
    } else {
        password_repsonse.setAttribute('type', 'password');
        document.getElementById("passtexticon").innerHTML = '<i class="fa fa-eye-slash" aria-hidden="true"></i>';
    }
}

function getPasswordResponseB() {
    var password_repsonse = document.getElementById("passwordB");
    if (password_repsonse.getAttribute('type') === "password") {
        password_repsonse.setAttribute('type', 'text');
        document.getElementById("passtexticonB").innerHTML = '<i class="fa fa-eye" aria-hidden="true"></i>';
    } else {
        password_repsonse.setAttribute('type', 'password');
        document.getElementById("passtexticonB").innerHTML = '<i class="fa fa-eye-slash" aria-hidden="true"></i>';
    }
}

function getEmailResponse() {
    var password_repsonse = document.getElementById("email");
    if (password_repsonse.getAttribute('type') === "password") {
        password_repsonse.setAttribute('type', 'text');
        document.getElementById("emailtexticon").innerHTML = '<i class="fa fa-eye" aria-hidden="true"></i>';
    } else {
        password_repsonse.setAttribute('type', 'password');
        document.getElementById("emailtexticon").innerHTML = '<i class="fa fa-eye-slash" aria-hidden="true"></i>';
    }
}

//password confirm show/hide
function getPasswordConfirmResponse() {
    var password_confirm_repsonse = document.getElementById("password-confirm");
    if (password_confirm_repsonse.getAttribute('type') === "password") {
        password_confirm_repsonse.setAttribute('type', 'text');
        document.getElementById("passtexticon_confirm").innerHTML = '<i class="fa fa-eye" aria-hidden="true"></i>';
    } else {
        password_confirm_repsonse.setAttribute('type', 'password');
        document.getElementById("passtexticon_confirm").innerHTML =
            '<i class="fa fa-eye-slash" aria-hidden="true"></i>';
    }
}

//password confirm show/hide
function getPasswordConfirmResponseB() {
    var password_confirm_repsonse = document.getElementById("password-confirmB");
    if (password_confirm_repsonse.getAttribute('type') === "password") {
        password_confirm_repsonse.setAttribute('type', 'text');
        document.getElementById("passtexticon_confirmB").innerHTML = '<i class="fa fa-eye" aria-hidden="true"></i>';
    } else {
        password_confirm_repsonse.setAttribute('type', 'password');
        document.getElementById("passtexticon_confirmB").innerHTML =
            '<i class="fa fa-eye-slash" aria-hidden="true"></i>';
    }
}
$(document).ready(function() {
    $('#account').change(function() {
        console.log($(this).val())
        if ($(this).val() == "Business") {
            $("#business_name").prop('required', true);
            $("#company_website").prop('required', true);
            $("#first_name").prop('required', false);
            $("#last_name").prop('required', false);
            $("#business-detail").show();
            $("#personal-detail").hide();
        } else {
            $("#first_name").prop('required', true);
            $("#last_name").prop('required', true);
            $("#business_name").prop('required', false);
            $("#company_website").prop('required', false);
            $("#business-detail").hide();
            $("#personal-detail").show();
        }
    });
});
</script>


@endsection
