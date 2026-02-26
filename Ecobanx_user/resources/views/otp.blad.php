@php $title = "KYC Verfication"; $atitle ="Kyc";
@endphp
@include('layouts.headercss')



<section class="sign-in-page  success-page">
<section class="sign-in-page ">
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
                                <img src="{{ url('img/otp-profile.svg') }}" alt="">
                            </div>
                         <h4 class="heading-title">Hi ! Austin Robertson</h4>
                         <p class="para-title">Enter your one time password  to access </p>
                         <div class="formcontentbox">
                            <div class="mlmwizardform">
                                    <form id="ms-login-form" class="siteformbg" method="post" autocomplete="off">
                                    <input type="hidden" name="_token" value="p23iDPFkMvoMBFKl0kW8O9aywlRwvAYiE1Xesrwb">                   
                                     <input type="hidden" id="get_current_l" value="1">
                                        <div class="form-card">
                                            <h5 class="enter-otp">Enter OTP</h5>
                                             <div class="userInput">
                                              <input type="text" id='ist' maxlength="1" onkeyup="clickEvent(this,'sec')">
                                              <input type="text" id="sec" maxlength="1" onkeyup="clickEvent(this,'third')">
                                              <input type="text" id="third" maxlength="1" onkeyup="clickEvent(this,'fourth')">
                                              <input type="text" id="fourth" maxlength="1" onkeyup="clickEvent(this,'fifth')">
                                              <input type="text" id="fifth" maxlength="1">
                                            </div>
                                            <div class="formcontentbox">
                                                <a class="btn next_l action-button yellowbtn" href="dashboard.html">Verify</a>
                                            </div>
                                        </div>
                                                                 
                                </form>
                            </div>
                        </div>
                        </div>
                     </div>
                </div>
<!--                 
                <div class="col-lg-6 col-xl-6 col-md-12 col-sm-12 col-xs-12">
                    <div class="signin-right-side-img">
                        <img src="{{ url('img/otp-pageright-img.png') }}" alt="" class="img-fluid">
                    </div>
                </div> -->
                
            </div>
        </div>
    </section>


    <script>
    function clickEvent(first,last){
        if(first.value.length){
          document.getElementById(last).focus();
        }
      }
      </script>


</body>
</html>
