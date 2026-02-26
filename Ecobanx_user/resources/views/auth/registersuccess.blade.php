@php
$title = "Success";
@endphp
@extends('layouts.app')

@section('content')
<section class="sign-in-page success-page">
    <div class="container-fluid">
        <div class="row">
            <div class="col-lg-12 col-xl-12 col-md-12 col-sm-12 col-xs-12 my-auto bg-img">
                <div class="loginouterbox">
                    <div class="login-form">
                        <div class="logo">
                            <a href="{{ url('/') }}">
                                <img src="{{ url('/img/sign-in-logo.png') }}" alt="" class="img-fluid">
                            </a>
                        </div>

                        <div class="succes-icon">
                            <img src="{{ url('/img/succes-icon.png') }}" alt="">
                        </div>
                        @php
                        $successemail = \Session::get('successemail');
                        @endphp
                        <h4 class="success-title">Success !</h4>
                        <p class="para-title">A email has been send to your {{$successemail}}. Please click on the
                            verification link sent to your Email ID to activate your account. If you cannot find the
                            email, please check your spam and trash folders to ensure that the email hasn’t been marked
                            as spam or accidentally deleted.</p>
                        <div class="formcontentbox success">
                            <a class="btn next_l action-button yellowbtn" href="{{ url('/') }}">Back to home </a>
                            <a class="btn next_l resend" href="{{ url('reconfirm_account/'.$successemail)  }}">Resend
                                Verification Email</a>
                        </div>
                    </div>
                </div>
            </div>
            <!-- <div class="col-lg-6 col-xl-6 col-md-12 col-sm-12 col-xs-12">
                    <div class="signin-right-side-img">
                        <img src="{{ url('/img/confirm-pageright-img.png') }}" alt="" class="img-fluid">
                    </div>
                </div> -->

        </div>
    </div>
</section>
@endsection