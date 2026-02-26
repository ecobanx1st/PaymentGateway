@php $title = "$coin  Deposit"; $atitle ="Wallet";
@endphp
@include('layouts.headercss')

<section class="Dashboard-page">
  <div class="container-fluid">
   <div class="row">

    @include('layouts.menu')


    <div class="col-lg-10 col-xl-10 col-md-12 col-sm-12 col-xs-12">

     <div class="header-part-outer">



      <div class="head-title-part">
        <h1>{{ $coin }} Deposit</h1>
      </div>

    </div>


    <div class="dashboard-body wallet-body">

     <div class="row">
      @if (session('success'))
            <div class="success-message" role="alert"><i class="fa fa-check-circle text-success"></i> {{ session('success') }}</div>
            @endif
            @if (session('fail'))
            <div class="error-message" role="alert"><i class="fa fa-times-circle text-danger"></i>
              {{ session('fail') }}
            </div>              
            @endif

      <div class="col-lg-8 col-xl-8 col-md-12 col-sm-12 col-xs-12">
        <div class="deposit-card">
          <h3>{{ $coin }} Deposit</h3>
          <div class="copy-text ERC20">
            <input type="text" class="text" value="{{ $address }}" />
            <button>Copy</button>
          </div>
          <div class="copy-text TRC20" style="display: none;">
            <input type="text" class="text" value="{{ $trxaddress }}" />
            <button>Copy</button>
          </div>


          <div class="row">
            <div class="col-lg-6 col-xl-6 col-md-12 col-sm-12 col-xs-12">
              <h3>Network</h3>
               <select id='purpose' class="form-control" onChange="changeNetwork(this);">
                  @forelse($networks as $tokenList)
                  @if($tokenList->assertype == 'token' || $tokenList->assertype == 'ERC20')
                  <option value="{{ $tokenList->assertype }}" >Ethereum (ERC20)</option>
                  @elseif($tokenList->assertype == 'TRC20')
                  <option value="1">Tron (TRC20)</option>
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
              <h5><span>Minimum Deposit Limit </span>: {{ $coindetail->limit }} {{ $coin }}</h5>
              <h5><span>Deposit Fee </span> : {{ $coindetail->tradecom }} %</h5>
              <label>Note : Deposit may take from a few minutes to over 30 minutes.</label>
            </div>

            <div class="col-lg-6 col-xl-6 col-md-12 col-sm-12 col-xs-12">
              <div class="rq_code-card ERC20">
				@if(!empty($address))
					<a href="{{ route('qr', ['ethaddress' => $address]) }}" target="_blank" class="btn orangebg mb-20" download><button>Download</button></a>
				@endif
                <div class="qrcode">
					@if(!empty($address))
					{!! QrCode::size(180)->generate($address) !!}
					@endif
                </div>
              </div>
              <div class="rq_code-card TRC20" style='display:none;'>  
              @if(!empty($trxaddress))
                <a href="{{ route('qr', ['ethaddress' => $trxaddress]) }}" target="_blank" class="btn orangebg mb-20" download><button>Download</button></a>
                <div class="qrcode">
                  {!! QrCode::size(180)->generate($trxaddress) !!}
                </div>
				@endif
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="col-lg-4 col-xl-4 col-md-12 col-sm-12 col-xs-12">
        <div class="wallet-history">
         <table class="table-style-history table table-responsive">
           <tr>
             <th>Coin</th>
             <th>Available Balance</th>
           </tr>
           @forelse($comdetails as $key => $coinlist)
           <tr @if($coinlist->source == $coin) class="active-row" @endif>
             <td><a href="{{ url('/deposit/'.$coinlist->source) }}">
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
  let copyText = document.querySelector(".copy-text");
  //let copyText1 = document.querySelector(".copy-text1");
  copyText.querySelector("button").addEventListener("click", function () {
   let input = copyText.querySelector("input.text");
   input.select();
   document.execCommand("copy");
   copyText.classList.add("active");
   window.getSelection().removeAllRanges();
   setTimeout(function () {
    copyText.classList.remove("active");
  }, 2500);
 });

$('#purpose').on('change', function() {
      if ( this.value == '1')
      {
        $(".TRC20").show();
        $(".ERC20").hide();
      }
      else
      {
        $(".ERC20").show();
        $(".TRC20").hide();
      }
    });
</script>

</body>
</html>
