@php $title = "Invoice Builder"; $atitle ="merchant";
@endphp
@include('layouts.headercss')
</section>
</header>

<section class="paymentstepsbg">
  <div class="container">
    <div class="row">
      <div class="stepsbanner">
        <div class="logo text-center">
            <a href="{{ url('/') }}">
                <img src="{{ url('img/logo.png') }}" alt="logo">
            </a>
        </div>
       </div>

       <div class="col-lg-4 coinselect">
              <div class="coinbg active">
                <div class="cointable text-center">
                  <h4 class="h4">Item Name</h4>
                  <h5 class="h5 text-uppercase">Flower </h5>
                </div>
              </div>
            </div>

            <div class="col-lg-4 coinselect">
              <div class="coinbg active">
                <div class="cointable text-center">
                  <h4 class="h4">Item Description</h4>
                  <h5 class="h5 text-uppercase">Test message </h5>
                </div>
              </div>
            </div>

            <div class="col-lg-4 coinselect">
              <div class="coinbg active">
                <div class="cointable text-center">
                  <h4 class="h4">Amount </h4>
                  <h5 class="h5 text-uppercase">0.10000000 BTC </h5>
                </div>
              </div>
            </div>

      <div class="col-xl-6 col-lg-6 col-md-12 col-sm-12 col-xs-12 boxb mx-auto">
        <form action="" id="profileForm" method="POST" autocomplete="off">
          <input type="hidden" name="_token" value="4tsmAlDUyfmSoOvNuBXvy1cEObBUFNnBnCAUZqd5">         
           <div class="stepsbanner coinbanner">
            <h4 class="headt">Select A Coin</h4>
            <div class="row">
              <input type="hidden" name="currency" value="BTC">
              <input type="hidden" name="user_id" value="">
              <input type="hidden" name="amount" value="2">
              <input type="hidden" name="selected_token" id="selected_token" value="BTC">
              <input type="hidden" name="selected_amount" id="selected_amount" value="2.00000000">
                                           
             <div class="col-md-6 coinselect" onclick="getPaymentCurrency('BTC', '2.00000000')" style="">
              <div class="coinbg active" id="BTCdata">
                <div class="cointable cointab">
                  <img src="{{ url('img/btc.svg') }}">
                </div>
                <div class="cointable">
                  <h4 class="h4">2.00000000</h4>
                  <h5 class="h5 text-uppercase">BTC </h5>
                </div>
              </div>
            </div>
                                       
             <div class="col-md-6 coinselect" onclick="getPaymentCurrency('ETH', '26.85376368')" style="cursor: not-allowed">
              <div class="coinbg" id="ETHdata">
                <div class="cointable cointab">
                  <img src="{{ url('img/eth.svg') }}">
                </div>
                <div class="cointable">
                  <h4 class="h4">26.85376368</h4>
                  <h5 class="h5 text-uppercase">ETH </h5>
                </div>
              </div>
            </div>
                                       
             <div class="col-md-6 coinselect" onclick="getPaymentCurrency('USDT', '33650.44891834')" style="cursor: not-allowed">
              <div class="coinbg" id="USDTdata">
                <div class="cointable cointab">
                  <img src="{{ url('img/usdt.svg') }}">
                </div>
                <div class="cointable">
                  <h4 class="h4">33650.44891834</h4>
                  <h5 class="h5 text-uppercase">USDT  - ERC20 </h5>
                </div>
              </div>
            </div>
                        <div class="col-md-6 coinselect" onclick="getPaymentCurrency('TRC', '33650.44891834')" style="cursor: not-allowed">
              <div class="coinbg" id="TRCdata">
                <div class="cointable cointab">
                  <img src="{{ url('img/usdt.svg') }}">
                </div>
                <div class="cointable">
                  <h4 class="h4">33650.44891834</h4>
                  <h5 class="h5 text-uppercase">USDT - TRC20</h5>
                </div>
              </div>
            </div>
                                       
             <div class="col-md-6 coinselect" onclick="getPaymentCurrency('USDC', '33650.44891834')" style="cursor: not-allowed">
              <div class="coinbg" id="USDCdata">
                <div class="cointable cointab">
                  <img src="{{ url('img/usdc.svg') }}">
                </div>
                <div class="cointable">
                  <h4 class="h4">33650.44891834</h4>
                  <h5 class="h5 text-uppercase">USDC  - ERC20 </h5>
                </div>
              </div>
            </div>
           </div>
        </div>
      </form>
    </div>

    <div class="col-xl-6 col-lg-6 col-md-12 col-sm-12 col-xs-12 boxb mx-auto">
        <form action="" id="profileForm" method="POST" autocomplete="off">
          <input type="hidden" name="_token" value="4tsmAlDUyfmSoOvNuBXvy1cEObBUFNnBnCAUZqd5">         
           <div class="stepsbanner coinbanner invoice">
            <h4 class="headt">Buyer Details</h4>
            <form id="ms-login-form" class="siteformbg" >
                                    @csrf
                                    <fieldset class="buyer">
                                        <div class="form-card invoice">
                                            <div class="form-group ">
                                                <input id="email" type="email" placeholder="Email Id *" class="form-control" >
                                               
                                            </div>
                                        </div>
                                    </fieldset>

                                    <div class="row">
                                        <div class="col-xl-6 col-lg-6 col-md-12 col-sm-12 col-xs-12">
                                                <fieldset class="buyer">
                                                    <div class="form-card invoice">
                                                        <div class="form-group ">
                                                            <input type="text" placeholder="First Name *" class="form-control" >
                                                           
                                                        </div>
                                                    </div>
                                                </fieldset>
                                        </div>

                                        <div class="col-xl-6 col-lg-6 col-md-12 col-sm-12 col-xs-12">
                                                <fieldset class="buyer">
                                                    <div class="form-card invoice">
                                                        <div class="form-group ">
                                                            <input id="name" type="text" placeholder="Last Name *" class="form-control" >
                                                           
                                                            
                                                        </div>
                                                    </div>
                                                </fieldset>
                                        </div>

                                    </div>

                                    <hr>


                                </button>
                                </form>

                                <h4 class="headt">Shipping Details</h4>
                                 <form id="ms-login-form" class="siteformbg" >
                                    @csrf
                                    <fieldset class="buyer">
                                        <div class="form-card invoice">
                                            <div class="form-group ">
                                                <input id="address" type="text" placeholder="Address *" class="form-control" >
                                            </div>
                                        </div>
                                    </fieldset>

                                    <div class="row">
                                        <div class="col-xl-6 col-lg-6 col-md-12 col-sm-12 col-xs-12">
                                                <fieldset class="buyer">
                                                    <div class="form-card invoice">
                                                        <div class="form-group ">
                                                            <input id="city" type="text" placeholder="City *" class="form-control" >
                                                        </div>
                                                    </div>
                                                </fieldset>
                                        </div>

                                        <div class="col-xl-6 col-lg-6 col-md-12 col-sm-12 col-xs-12">
                                                <fieldset class="buyer">
                                                    <div class="form-card invoice">
                                                        <div class="form-group ">
                                                            <select name="Country" id="Country">
                                                                <option value="volvo">Select country</option>
                                                                 <option value="volvo">India</option>
                                                                <option value="saab">India</option>
                                                                <option value="mercedes">India</option>
                                                                <option value="audi">India</option>
                                                            </select>
                                                        </div>
                                                    </div>
                                                </fieldset>
                                        </div>

                                    </div>

                                    <fieldset class="buyer">
                                        <div class="form-card invoice">
                                            <div class="form-group ">
                                                <input id="phone"  placeholder="Phone Number *" class="form-control" >
                                            </div>
                                        </div>
                                    </fieldset>

                                </button>
                                </form>
          <div class="row"> 
            <div class="col-md-12">
              <div class="form-group text-center">
                <button type="submit" id="save_btn" class="btn btn-green">Complete Checkout</button>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  </div>
</div>
</section>


<script
src="https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/js/bootstrap.bundle.min.js"></script>

<script src="{{ url('js/validation.js') }}"></script>


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