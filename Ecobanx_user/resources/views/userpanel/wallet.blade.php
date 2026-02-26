@php $title = "Wallet"; $atitle ="Wallet";
@endphp
@include('layouts.headercss')
  
<section class="Dashboard-page">
  <div class="container-fluid">
     <div class="row">

      @include('layouts.menu')


        <div class="col-lg-10 col-xl-10 col-md-12 col-sm-12 col-xs-12">

               <div class="header-part-outer">

                <div class="common-header-style title-outer">
                  <div class="row">

                    <div class="col-lg-6 col-xl-6 col-md-6 col-sm-6 col-xs-6">
                      <div class="logo-payment"><a href="index.html"><img src="img/logo.png" alt="logo"></a></div>
                    </div>

                    <div class="col-lg-6 col-xl-6 col-md-6 col-sm-6 col-xs-6">
                      <div class="notify-part">
                        <div class="notify"><img src="img/Notification.png"></div>
                        <div class="message"><img src="img/message.png"></div>
                      </div>
                    </div>

                  </div>
                </div>

                <div class="head-title-part">
                  <h1>My Wallet</h1>
                </div>

              </div>

              <div class="below-header bdw">

                  <div class="icon-dash-outer">
                  	<label><p>Available Balance</p><span>$ 0.00</span></label>
                  	<div class="icon-dash-inner"><img src="img/balance.png"></div>
                  </div>
                  <div class="icon-dash-outer">
                  	<label><p>Total Deposit</p><span>$ 0.00</span></label>
                  	<div class="icon-dash-inner"><img src="img/deposit.png"></div>
                  </div>
                  <div class="icon-dash-outer">
                  	<label><p>Total Withdraw</p><span>$ 0.00</span></label>
                  	<div class="icon-dash-inner"><img src="img/withdraw.png"></div>
                  </div>
                
              </div>


              <div class="dashboard-body wallet-body">
                   @if ($message = Session::get('error'))
                        <div class="error-message" role="alert"><i class="fa fa-times-circle text-danger"></i> 
                          <strong>{{ $message }}</strong>
                        </div>
                        @endif
                   <div class="row">

                        
                    <div class="col-lg-8 col-xl-8 col-md-12 col-sm-12 col-xs-12">
                      <div class="wallet-history">
                        
							<table class="table-style-history table table-responsive">
							<tr>
							<th>Coin</th>
							<th>Available Balance</th>
							<th>Action</th>
							</tr>
              @forelse($coins as $coin)
							<tr>
							<td><div class="mwc-inner"><div class="mwc"><img src="{{ url('/img/color/'.$coin->image) }}"></div><span>{{ $coin->coinname }}</span></div></td>
							<td>
                <span class="balance-span">
                  @if(!empty($wallet[$coin->source]['balance']))
                      {{ display_format($wallet[$coin->source]['balance'],8) }}
                      @else
                      -
                      @endif
                </span>
              </td>
              @if($coin->type !='fiat')
              <td>
                  <div class="deposit-withdraw">
                  <a class="deposit-cls" href="{{ url('/deposit/'.$coin->source) }}">Deposit</a>
                  <a href="{{ url('/withdraw/'.$coin->source) }}" class="withdraw-cls">Withdraw</a>
                </div>
              </td>
              @else
              <td>
                <div class="deposit-withdraw">
                <a href="{{ url('fiatdeposit/'.$coin->source) }}" class="deposit-cls">Deposit</a>
                <a href="{{ url('fiatwithdraw/'.$coin->source) }}" class="withdraw-cls">Withdraw</a>
              </div>
              </td>
              @endif
              @empty
              <tr><td>No coins Added</td></tr>
              @endforelse
							
							</table>
                      </div>
                    </div>

                    <div class="col-lg-4 col-xl-4 col-md-12 col-sm-12 col-xs-12">
                    	<div class="wallet-balance-outer">
                         <h6 class="wallet-balance">Wallet Balance</h6>
                         <div id="spotwalletbalance" class="chartbalancebox"></div>
                        </div>
                    </div>

                   </div>

              </div>
          
        </div>

     </div>
  </div>
</section>

<script src="https://code.highcharts.com/highcharts.js"></script>
    <script src="https://code.highcharts.com/modules/exporting.js"></script>
    <script src="https://code.highcharts.com/modules/export-data.js"></script>
    <script src="https://code.highcharts.com/modules/accessibility.js"></script>
    <script>
    Highcharts.chart("spotwalletbalance", {
      chart: {
        plotBackgroundColor: null,
        plotBorderWidth: null,
        plotShadow: !1,
        type: "pie",
        outline: !1
      },
      title: {
        text: ""
      },
      tooltip: {
        pointFormat: "{series.name}: <b>{point.percentage:.1f}%</b>"
      },
      accessibility: {
        point: {
          valueSuffix: "%"
        }
      },
      plotOptions: {
        pie: {
          allowPointSelect: !0,
          cursor: "pointer",
          dataLabels: {
            enabled: !1
          },
          showInLegend: !0
        }
      },
      series: [{
        name: "Crypto",
        colorByPoint: !0,
        innerSize: "60%",
        data: [
        @forelse($coins as $coin)
        @php 
        $decimal = $coin->point_value;
        if(isset($wallet[$coin->source]['balance']) && $wallet[$coin->source]['balance'] > 0){
          $avil = display_format($wallet[$coin->source]['balance'], $decimal);
        } else{
          $avil = display_format("0", $decimal);
        }
        @endphp
          {
          name: "{{ $coin->source }} {{ $avil }}",
          y: .369
          },
        @empty
        {
          name: "LIO 0.00310630",
          y: .369
        }, {
          name: "EC pay 106.63694432",
          y: .369
        }, {
          name: "BTC  0.00000839",
          y: .369
        }, {
          name: "ETH  0.00000025",
          y: .369
        }, {
          name: "BNB  0.00000025",
          y: .369
        },{
          name: "TRX  0.00000025",
          y: .369
        },
        {
          name: "LTC  0.00000025",
          y: .369
        }
        @endforelse
        ]
      }],
      legend: {
        
        itemMarginTop: 5,
        itemMarginBottom: 5
      }
    });
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

</body>
</html>
