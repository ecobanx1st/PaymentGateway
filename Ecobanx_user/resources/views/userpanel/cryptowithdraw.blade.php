@php $title = "$coin  Withdraw"; $atitle ="Wallet";
@endphp
@include('layouts.headercss')
<style type="text/css">
  .error-message{
    color: red;
}
.success-message{
    color: rgb(2, 79, 2);
}
</style>
<section class="Dashboard-page">
  <div class="container-fluid">
   <div class="row">

    @include('layouts.menu')


    <div class="col-lg-10 col-xl-10 col-md-12 col-sm-12 col-xs-12">

     <div class="header-part-outer">

      <div class="head-title-part">
        <h1>{{ $coin }} Withdraw</h1>
      </div>

    </div>


    <div class="dashboard-body wallet-body">

     <div class="row">

      <div class="col-xl-8 col-lg-6 col-md-12 col-sm-12 col-xs-12">
        <div class="deposit-card">
          <div class="row">
            <div class="col-xl-8 col-lg-12 col-md-12 col-sm-12 col-xs-12">
              @if (session('success'))
            <div class="success-message" role="alert"><i class="fa fa-check-circle text-success"></i> {{ session('success') }}</div>
            @endif
            @if (session('fail'))
            <div class="error-message" role="alert"><i class="fa fa-times-circle text-danger"></i>
              {{ session('fail') }}
            </div>
            @endif
              <form method="post" id="withdraw_form" autocomplete="off" action="{{ url('verifywithdraw') }}">
                {{ csrf_field() }}
                <input type="hidden" id="coin" name="coin" value="{{ $coin }}">
                <input type="hidden" class="form-control" name="from_address" value="{{ $address }}" readonly="">
              <div class="enter-value">
                <h3>Withdraw Address</h3>
                <div class="copy-text">
                  <input type="text" class="form-control" name="address" id="withdraw_address" required>

                  @if ($errors->has('address'))
                  <span class="help-block">
                  <strong>{{ $errors->first('address') }}</strong>
                  </span>
                  @endif
                </div>
              </div>

              <div class="enter-value">
                <h3>Withdraw Network</h3>
                <div class="copy-text">
                 <select id='purpose' name="network" class="form-control" onChange="changeNetwork(this);">
                  @forelse($networks as $tokenList)
                  @if($tokenList->assertype == 'token' || $tokenList->assertype == 'ERC20')
                  <option value="{{ $tokenList->assertype }}" >Ethereum (ERC20)</option>
                  @elseif($tokenList->assertype == 'TRC20')
                  <option value="{{ $tokenList->assertype }}">Tron (TRC20)</option>
                  @elseif($tokenList->assertype == 'BEP20')
                  <option value="{{ $tokenList->assertype }}">BSC (BEP20)</option>
                  @elseif($tokenList->assertype == 'MATIC20')
                  <option value="{{ $tokenList->assertype }}">Polygon (ERC20)</option>
                  @else
                  <option value="{{ $tokenList->assertype }}">{{ $tokenList->coinname }}</option>
                  @endif
                  @empty
                  <option value="0">Ethereum (ERC20)</option>
                  @endforelse
              </select>

                  @if ($errors->has('amount'))
                  <span class="help-block">
                  <strong>{{ $errors->first('amount') }}</strong>
                  </span>
                  @endif
                </div>
              </div>

              <div class="enter-value">
                <h3>Withdraw Amount</h3>
                <div class="copy-text">
                  <input class="form-control allownumericwithdecimal" id="crypto_withdraw_amount" type="text" name="amount" step="0.0001" min="0" max="10000000000" required />

                  @if ($errors->has('amount'))
                  <span class="help-block">
                  <strong>{{ $errors->first('amount') }}</strong>
                  </span>
                  @endif
                </div>
              </div>

              <div class="dashboard-body history-body">

                <div class="row">


                  <div class="col-lg-12 col-xl-12 col-md-12 col-sm-12 col-xs-12">
                    <ul class="nav nav-pills DWT WDP" role="tablist">
                     <a href="#"><li class="nav-item">
                       <span class="nav-link" data-bs-toggle="pill" onclick="calculateBalanceAmount('25')">25%</span>
                     </li></a>
                     <a href="#"><li class="nav-item">
                       <span class="nav-link" data-bs-toggle="pill" onclick="calculateBalanceAmount('50')">50%</span>
                     </li></a>
                     <a href="#"><li class="nav-item">
                       <span class="nav-link" data-bs-toggle="pill" onclick="calculateBalanceAmount('75')">75%</span>
                     </li></a>
                     <a href="#"><li class="nav-item">
                      <span class="nav-link" data-bs-toggle="pill" onclick="calculateBalanceAmount('100')">100%</span>
                    </li></a>
                  </ul>
                </div>


              </div>

            </div>


            <div class="withdraw-submit-btn submit-btn">
              <button>Submit</button>
            </div>
          </form>
          </div>

          <div class=" col-xl-4 col-lg-12 col-md-12 col-sm-12 col-xs-12">
            <div class="min-withdraw">
              <div class="withdraw-text">
                <h6>Min Withdraw</h6>
                <span>{{ display_format($coindetail->min_amount,$coindetail->point_value) }} {{ $coin }}</span>
              </div>

              <div class="withdraw-text">
                <h6>Max Withdraw</h6>
                <span>{{ display_format($coindetail->max_amount,$coindetail->point_value) }} {{ $coin }}</span>
              </div>

              <div class="withdraw-text">
                <h6>Total Withdraw</h6>
                <span><span id="withdraw_total">0.00000000</span> {{ $coin }}</span>
              </div>

              <div class="withdraw-text">
                <h6>Withdraw Fee</h6>
                <span><span  id="w_com">0.00000000</span> {{ $coin }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="col-xl-4 col-lg-6 col-md-12 col-sm-12 col-xs-12">
      <div class="wallet-history">
         <table class="table-style-history table table-responsive">
           <tr>
             <th>Coin</th>
             <th>Available Balance</th>
           </tr>
           @forelse($comdetails as $key => $coinlist)
           <tr @if($coinlist->source == $coin) class="active-row" @endif>
             <td><a href="{{ url('/withdraw/'.$coinlist->source) }}">
              <div class="mwc-inner"><div class="mwc"><img src="{{ url('/img/color/'.$coinlist->image) }}"></div><span>{{ $coinlist->source }}</span></div></a>
            </td>
            <td>
              <span class="balance-span">
                @if(!empty($wallet[$coinlist->source]['balance']))
                {{ display_format($wallet[$coinlist->source]['balance'],8) }}
                @else
                -
                @endif
              </span>
            </td>
          </tr>
          @empty
          @endforelse

        </table>
      </div>
   </div>


 </div>

</div>

</div>

</div>
</div>
</section>


<div class="mobile-menu-fixed">
  <ul class="menu-mobile">
    <li><a class="" href="dashboard.html"><div class="left-icons"><img src="img/left-side-icon-1.svg"></div>Dashboard</a></li>
    <li><a class="" href="merchant.html"><div class="left-icons"><img src="img/left-side-icon-2.svg"></div>Merchant</a></li>
    <li><a class="" href="history.html"><div class="left-icons"><img src="img/left-side-icon-3.svg"></div>History</a></li>
    <li><a class="" href="account-settings.html"><div class="left-icons"><img src="img/left-side-icon-4.svg"></div>Account</a></li>
    <li><a class="more-menu-bottom"><i class="fa-solid fa-ellipsis"></i>More</a></li>
  </ul>
  <ul class="extra-menu-mobile">
    <li><a class="" href="wallet.html"><div class="left-icons"><img src="img/left-side-icon-5.svg"></div>My Wallet</a></li>
    <li><a class="" href="#"><div class="left-icons"><img src="img/left-side-icon-6.svg"></div>Settings</a></li>
    <li><a class="" href="api-keys.html"><div class="left-icons"><img src="img/left-side-icon-7.svg"></div>API Keys</a></li>
    <li><a class="" href="ipn-history.html"><div class="left-icons"><img src="img/left-side-icon-8.svg"></div>IPN History</a></li>
  </ul>
</div>


<script src="https://cdn.jsdelivr.net/npm/apexcharts"></script>
<script>

  var options = {
    series: [1.000, 0.555, 1.53800, 3.38],
    labels: ['BTC', 'ETH', 'USDT', 'USDC'],
    chart: {
      width: '100%',
      type: 'donut',
      height: 250,
    },
    dataLabels: {
      enabled: false
    },
    responsive: [{
      breakpoint: 480,
      options: {
        chart: {
          width: 300
        },
        legend: {
          show: false
        }
      }
    }],
    legend: {
      position: 'bottom',
      offsetY: 0,
      height: 230,
      show: false
    }
  };


  var chart = new ApexCharts(document.querySelector("#chart"), options);
  chart.render();


</script>

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

<script>



$(".allownumericwithdecimal").on("keypress keyup blur",function (event) {
  $(this).val($(this).val().replace(/[^0-9\.]/g,''));
  if((event.which != 46 || $(this).val().indexOf('.') != -1) && (event.which < 48 || event.which > 57) && (event.which != 8) && event.which != 37) {
    event.preventDefault();
  }
});


  $(function() {
    $('#crypto_withdraw_amount').on('input', function() {
        this.value = this.value
.replace(/[^\d.]/g, '')             // numbers and decimals only
.replace(/(\..*)\./g, '$1')         // decimal can't exist more than once
.replace(/(\.[\d]{8})./g, '$1');   // not more than 4 digits after decimal
if(this.value == '0.0000' || this.value == '.0000'){
    this.value = '0.0000';
}
});
});

$('#crypto_withdraw_amount').on('keyup', function(){
    var amount   = parseFloat($('#crypto_withdraw_amount').val());
    var adminfee = parseFloat(amount) * parseFloat('<?php echo $withdraw_com ;?>' );
    var tranfee  = parseFloat(adminfee) + parseFloat('<?php echo $netfee;?>');
    var total    = parseFloat(amount) - parseFloat(tranfee);
    if(total > 0){
      $('#w_com').html(adminfee.toFixed(8));
      $('#withdraw_total').html(total.toFixed(8));
    } else {
      $('#w_com').html('0.00000000');
      $('#withdraw_total').html('0.00000000');
    }
  });
function calculateBalanceAmount(percent){
  var percentage = percent / 100;
  var balance = parseFloat({{$balance}}) * percentage;
  if(balance > 0){
    document.getElementById('crypto_withdraw_amount').value = balance;
  } else {
    document.getElementById('crypto_withdraw_amount').value = 0;
  }
}
</script>

</body>
</html>
