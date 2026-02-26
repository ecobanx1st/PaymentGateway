@php $title = "Pos Button"; $atitle ="merchant";
@endphp
@include('layouts.headercss')
</section>
</header>

<section class="paymentstepsbg">
  <div class="container">
    <div class="row">
      <div class="stepsbanner">
        <div class="logo text-center">
          <img src="{{ url('img/logo.png') }}" alt="logo">
        </div>
              </div>
      <div class="col-lg-6 col-md-6 col-sm-6 col-xs-12 boxb mx-auto">
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
          <div class="row"> 
            <div class="col-md-12">
              <div class="form-group text-center">
                <button type="submit" id="save_btn" class="btn btn-green">Complete Payment</button>
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