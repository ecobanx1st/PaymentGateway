@php
$title = "Sign In";
@endphp
@extends('layouts.app')

@section('content')
<section class="sign-in-page success-page">
    <div class="container-fluid">
        <div class="row">
            <div class="col-lg-12 col-xl-12 col-md-12 col-sm-12 col-xs-12 bg-img left-side"
                style="display: flex;justify-content: center;align-items: center;flex-direction: column">
                <div class="loginouterbox">
                    <div class="login-form">
                        <div class="logo">
                            <a href="{{ url('/') }}">
                                <img src="{{ url('/img/sign-in-logo.png') }}" alt="" class="img-fluid">
                            </a>
                        </div>

                        <h4 class="heading-title">{{ __('Login') }}</h4>
                        <p class="para-title">Sign in to stay connected.</p>
                        <div class="formcontentbox">
                            <div class="mlmwizardform">
                                @if ($message = Session::get('error'))
                                <div class="alert alert-danger alert-block">
                                    <strong>{{ $message }}</strong>
                                </div>
                                @endif


                                @if ($message = Session::get('status'))
                                <div class="alert alert-success alert-block">
                                    <strong><?php  echo $message;?></strong>
                                </div>
                                @endif
                                <form id="ms-login-form" class="siteformbg" method="POST" action="{{ route('login') }}">
                                    @csrf
                                    <fieldset>
                                        <div class="form-card log">
                                            <div class="form-group ">
                                                <label>Email Address<span class="text text-danger">*</span></label>
                                                <input id="email" type="email"
                                                    class="form-control @error('email') is-invalid @enderror"
                                                    name="email" value="{{ old('email') }}" required
                                                    autocomplete="email" autofocus>
                                                @error('email')
                                                <span class="text-danger errors-text show_error_email" role="alert">
                                                    <strong>{{ $message }}</strong>
                                                </span><br />
                                                @enderror
                                            </div>
                                        </div>
                                    </fieldset>
                                    <fieldset>
                                        <div class="form-card log">
                                            <div id="show_failed_login_password"></div>
                                            <div class="form-group ">
                                                <label>Password <span class="text text-danger">*</span></label>
                                                <div class="input-group">
                                                    <input type="password" class="form-control" name="password"
                                                        class="form-control" value="{{ old('password') }}" id="password"
                                                        required autocomplete="password" autofocus>
                                                    <span class="input-group-text" id="passtexticon"
                                                        onClick="getPasswordResponse()"><i class="fa fa-eye-slash"></i>
                                                    </span>
                                                </div>
                                                @error('password')
                                                <span class="text-danger errors-text show_error_email" role="alert">
                                                    <strong>{{ $message }}</strong>
                                                </span><br />
                                                @enderror
                                            </div>

                                            @if (Route::has('password.request'))
                                            <h5>
                                                <a class="t-blue" href="{{ route('password.request') }}">
                                                    {{ __('Forgot Your Password?') }}
                                                </a>
                                            </h5>
                                            @endif

                                            <div class="form-group text-center ">

                                                {!! NoCaptcha::display() !!}
                                                @if ($errors->has('g-recaptcha-response'))
                                                <span class="text-danger errors-text show_error_password">
                                                    <strong>{{ $errors->first('g-recaptcha-response') }}</strong>
                                                </span>
                                                @endif

                                            </div>
                                        </div>
                                    </fieldset>


                                    <div class="d-flex">
                                        <!-- <div class="Remember">
                                            <input type="checkbox" id="rememberMe" name="remember" {{ old('remember') ? 'checked' : '' }}> <label for="rememberMe">Remember me</label>
                                        </div> -->


                                    </div>
                                    <button class="btn next_l action-button yellowbtn">
                                        {{ __('Login') }}
                                    </button>
                                </form>

                            </div>
                            <div class="btnsnfg">
                                <p class="para-title">Don’t have an account? <a href="{{ route('register') }}"
                                        class="t-blue">Click here
                                        to sign up.</a></p>
                            </div>
                        </div>
                    </div>
                </div>

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
            <!-- <div class="col-lg-6 col-xl-6 col-md-12 col-sm-12 col-xs-12 right-side">
                <div class="signin-right-side-img">
                     <img src="{{ url('/img/confirm-pageright-img.png') }}" alt="" class="img-fluid">
                </div>
            </div> -->

        </div>
    </div>
</section>

{!! NoCaptcha::renderJs() !!}

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
</script>
@endsection
