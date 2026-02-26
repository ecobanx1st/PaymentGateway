@php
$title = "Reset Password";
@endphp
@extends('layouts.app')

@section('content')
<section class="sign-in-page success-page">
    <div class="container-fluid">
        <div class="row">
            <div class="col-lg-12 col-xl-12 col-md-12 col-sm-12 col-xs-12  bg-img">
                <div class="loginouterbox">
                    <div class="login-form">
                        <div class="logo">
                            <a href="{{ url('/') }}">
                                <img src="{{ url('img/sign-in-logo.png') }}" alt="" class="img-fluid">
                            </a>
                        </div>

                        <h4 class="heading-title">Reset Password</h4>
                        <p class="para-title">Enter your email address and we’ll send you an email with instructions to
                            reset your password</p>
                        <div class="formcontentbox">
                            <div class="mlmwizardform">
                                @if (session('status'))
                                <div class="alert alert-success" role="alert">
                                    {{ session('status') }}
                                </div>
                                @endif

                                    <form method="POST" action="{{ route('password.email') }}">
                                        @csrf
                                    <fieldset>
                                        <div class="form-card">
                                            <div class="form-group ">
                                                <label>Email Address<span class="text text-danger">*</span></label>
                                                <input id="email" type="email"
                                                    class="form-control @error('email') is-invalid @enderror"
                                                    name="email" value="{{ old('email') }}" required
                                                    autocomplete="email" autofocus>

                                                @error('email')
                                                <span class="text-danger errors-text show_error_email" role="alert">
                                                    <strong>{{ $message }}</strong>
                                                </span>
                                                @enderror<br />
                                            </div>
                                            <div class="text-center">
                                                    <div class="form-group g-recaptcha-whl">
                                                        {!! NoCaptcha::display() !!}

                                                        @if ($errors->has('g-recaptcha-response'))
                                                        <span class="text-danger errors-text show_error_password">
                                                        <strong>{{ $errors->first('g-recaptcha-response') }}</strong>
                                                    </span>
                                                    @endif
                                                </div>
                                            </div>
                                            <button class="btn next_l action-button yellowbtn">Reset</button>
                                        </div>
                                    </fieldset>

                                </form>
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


        </div>
    </section>
{!! NoCaptcha::renderJs() !!}

@endsection
