@php
    $title = 'Reset Password';
@endphp
@extends('layouts.app')

@section('content')
    <section class="sign-up-page success-page">
        <div class="container-fluid">
            <div class="row">
                <!-- <div class="col-lg-6 col-xl-6 col-md-12 col-sm-12 col-xs-12 left-side">
            <div class="signin-left-side-img">
              <img src="{{ url('img/confirm-pageright-img.png') }}" alt="" class="img-fluid">
            </div>
          </div> -->

                <div class="col-lg-12 col-xl-12 col-md-12 col-sm-12 col-xs-12  bg-img right-side">
                    <div class="loginouterbox">
                        <div class="login-form">
                            <div class="logo">
                                <a href="{{ url('/') }}">
                                    <img src="{{ url('img/sign-in-logo.png') }}" alt="" class="img-fluid">
                                </a>
                            </div>

                            <h4 class="heading-title">{{ __('Reset Password') }}</h4>
                            @if ($message = Session::get('error'))
                                <div class="alert alert-danger alert-block">
                                    <strong>{{ $message }}</strong>
                                </div>
                            @endif


                            @if ($message = Session::get('status'))
                                <div class="alert alert-success alert-block">
                                    <strong><?php echo $message; ?></strong>
                                </div>
                            @endif
                            <div class="sign-up-container">
                                <form method="POST" action="{{ route('password.update') }}">
                                    @csrf
                                    <input type="hidden" name="token" value="{{ $token }}">
                                    <div class="user_details reset">
                                        <div class="input_pox">
                                            <span class="datails">Email</span>
                                            <input id="email" type="email"
                                                class="form-control @error('email') is-invalid @enderror" name="email"
                                                value="{{ $email ?? old('email') }}" required autocomplete="email" autofocus
                                                readonly>
                                            @error('email')
                                                <span class="text-danger errors-text" role="alert">
                                                    <strong>{{ $message }}</strong>
                                                </span>
                                            @enderror
                                        </div>
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
                                                    class="form-control" value="{{ old('password') }}"
                                                    id="password-confirm" required autocomplete="new-password" autofocus>
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
                                            uppercase (ex: A, B, C,
                                            etc), one lowercase letter, one numeric digit (ex: 1, 2, 3, etc) and one special
                                            character (ex: @,
                                            #, $, etc)</span>
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
                                    <div class="button reset">
                                        <button
                                            class="btn next_l action-button yellowbtn">{{ __('Reset Password') }}</button>
                                    </div>
                            </div>
                            </form>
                        </div>
                        @error('password')
                            <span class="text-danger errors-text show_error_email" role="alert">
                                <strong>{{ $message }}</strong>
                            </span><br />
                        @enderror
                    </div>
                    {{-- <span class="noteshow">Your password must contain at least 8 characters, one uppercase (ex: A, B, C,
                        etc), one lowercase letter, one numeric digit (ex: 1, 2, 3, etc) and one special character (ex: @,
                        #, $, etc)</span> --}}
                </div>
                {{-- <div class="text-center">
                    <div class="form-group g-recaptcha-whl">
                        {!! NoCaptcha::display() !!}

                        @if ($errors->has('g-recaptcha-response'))
                            <span class="text-danger errors-text show_error_password">
                                <strong>{{ $errors->first('g-recaptcha-response') }}</strong>
                            </span>
                        @endif
                    </div>
                </div>
                <div class="button reset">
                    <button class="btn next_l action-button yellowbtn">{{ __('Reset Password') }}</button>
                </div> --}}
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
        {!! NoCaptcha::renderJs() !!}

        </div>
    </section>



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
