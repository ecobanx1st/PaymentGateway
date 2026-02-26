@php $title = "Dashboard"; $atitle ="Dashboard";
@endphp
@include('layouts.headercss')
  
<section class="Dashboard-page">
  <div class="container-fluid">
     <div class="row">

      @include('layouts.menu')


        <div class="col-lg-10 col-xl-10 col-md-12 col-sm-12 col-xs-12">

               <div class="header-part-outer">

                <div class="head-title-part">
                  <h1>Dashboard</h1>
                  <p>We are on a mission to help developers like you to build beautiful projects for free.</p>
                </div>

              </div>
              <div class="dashboard-body">
                   
                   <div class="row">


                    <div class="col-lg-6 col-xl-6 col-md-12 col-sm-12 col-xs-12">
                 

                      <div class="current-balance-outer">

                        <div class="current-balance">
                            
                            <div class="current-balance-top">
                              <div class="current-balance-top-inner">
  
                                <div class="top-part-cb">
                                  <div class="top-part-cb-left">
                                    <div class="pg-logo-cb"><img src="{{ url('img/pg-logo-cb.png') }}"></div>
                                    <!-- <span>Business Account</span> -->
                                  </div>
                                  <div class="top-part-cb-right">
                                    <div class="Current-Balance-head"><span>Current Balance</span><p>$0</p></div>
                                    <div class="cb-right-img-doble-circle">
                                      <img src="{{ url('img/cb-right-img-doble-circle.png') }}" alt="cb-right-img-doble-circle">
                                    </div>
                                  </div>
                                </div>
  
                                <div class="last-part-cb">
                                  @forelse($comdetails as $key => $coinlist)
                                   <div class="coin-block">
  
                                     <div class="coin-block-inner">
                                      <div><img src="{{ url($coinlist->image) }}"></div>
                                      <span>{{ $coinlist->source }}</span>
                                     </div>
  
                                     <div class="coin-block-inner-balance">
                                      <span>@if(!empty($wallet[$coinlist->source]['balance']))
                                            {{ display_format($wallet[$coinlist->source]['balance'],8) }}
                                            @else
                                            -
                                            @endif
                                        </span>
                                     </div>
                                     
                                   </div>
                                  @empty
                                  @endforelse
                                   
  
                                </div>
                              
                              </div>
                            </div>
  
                        </div>
  
  
                        <div class="showall-btn">
                        <img src="{{ url('img/showall-btn.png') }}" alt="showall-btn"/>
                        </div>

  
                        <div class="current-balance-bottom">
                          @forelse($comdetails as $key => $coinlist)
                              <div class="current-balance-bottom-inner">
                                <div class="coin-coin">
                                  <span class="coin-coin-1"><img src="{{ url($coinlist->image) }}"/> {{ $coinlist->coinname }}</span>
                                  <span class="coin-coin-2">$ <span class="last_price_{{$coinlist->source}}USD">{{ $coinlist->usd_price }}</span></span>
                                  <span class="coin-coin-3">(<span class="price_change_{{$coinlist->source}}USD">-2.48%</span>)</span>
                                </div>
                              </div>
                          @empty
                          @endforelse                              
  
                            </div>
  
                          </div>

                     

                    </div>



                    <div class="col-lg-6 col-xl-6 col-md-6 col-sm-12 col-xs-12">

                      <div>
                      <div id="chart-container" class="box-shadow-bottom col-12 px-0 bg-white transaction-history payment-transaction-chart" style="flex: 0 0 30%; overflow: hidden;">
                        <h6>Payment Transaction Chart</h6>
                        <div class="Payment-Transaction-Chart-select custom-select">
                        <select>
                          <option value="This week">Last Year</option>
                          <option value="Last week">Last week</option>
                        </select>
                      </div>
                        <div style="overflow: hidden;">
                          <div id="chart"></div>
                        </div>
                      </div>
                      </div>

                      <div class="transaction-history">
                         <h6>Recent Transaction</h6>
                         <div class="table-responsive site-scroll-d" data-simplebar>
                <table class="table table-small-font no-mb table-borderded">
                <thead>
                  <tr>  
                      <th>S.No</th>
                    <th>DATE AND TIME</th>
                    <th>RECEIVED/SENT</th>
                    <th>NAME</th>
                    <th>COIN</th>
                    <th>AMOUNT</th>
                    <th>STATUS</th>
                  </tr>
                </thead>
                <tbody>
                                @if(count($history) > 0)
                                @php $i = 1; @endphp
                                    @foreach($history as $transaction)
                                    <tr>
                                      <td>{{ $i }}</td>
                                        <td>{{ date('d-m-Y H:i:s', strtotime($transaction->created_at)) }}</td>
                                        <td>{{ 'From' }}</td>
                                        <td>{{ $transaction->BuyerInformation['first_name'] }} {{ $transaction->BuyerInformation['last_name'] }}</td>
                                        <td>{{ $transaction->currency1 }}</td>
                                        <td>{{ number_format($transaction->amount1, 8, '.', '') }}</td>
                                         <td>
                                          @if($transaction->status == 0)
                                          <a href="{{ url('/trans_view/'.$transaction->txn_id) }}">Waiting</a>
                                          @elseif($transaction->status == -1)

                                          <a href="{{ url('/trans_view/'.$transaction->txn_id) }}"> Cancelled </a>

                                            @elseif($transaction->status == 1)
                                            <a href="{{ url('/trans_view/'.$transaction->txn_id) }}">Confirmed</a>
                                          @elseif($transaction->status == 2)
                                            <a href="{{ url('/trans_view/'.$transaction->txn_id) }}">Queued</a>

                                           @elseif($transaction->status == 100)
                                            <a href="{{ url('/trans_view/'.$transaction->txn_id) }}">Completed</a> 
                                          @endif

                                         </td>
                                      
                                    </tr>
                                    @php
                                    $i ++ ;@endphp
                                    @endforeach
                                @else
                                    <tr><td colspan="8" class="text-center"><div class="transaction-details">                           
                              <span>Record not found !</span>
                         </div></td></tr>
                                @endif
                            </tbody>
                            </table>
                            @if(count($history) > 0)
                              {{ $history->links() }}
                            @endif
                            </div>
                         
                      </div>

                    </div>


                   </div>

              </div>
          
        </div>

     </div>
  </div>
</section>




<script>


var x, i, j, l, ll, selElmnt, a, b, c;
/* Look for any elements with the class "custom-select": */
x = document.getElementsByClassName("custom-select");
l = x.length;
for (i = 0; i < l; i++) {
  selElmnt = x[i].getElementsByTagName("select")[0];
  ll = selElmnt.length;
  /* For each element, create a new DIV that will act as the selected item: */
  a = document.createElement("DIV");
  a.setAttribute("class", "select-selected");
  a.innerHTML = selElmnt.options[selElmnt.selectedIndex].innerHTML;
  x[i].appendChild(a);
  /* For each element, create a new DIV that will contain the option list: */
  b = document.createElement("DIV");
  b.setAttribute("class", "select-items select-hide");
  for (j = 1; j < ll; j++) {
    /* For each option in the original select element,
    create a new DIV that will act as an option item: */
    c = document.createElement("DIV");
    c.innerHTML = selElmnt.options[j].innerHTML;
    c.addEventListener("click", function(e) {
        /* When an item is clicked, update the original select box,
        and the selected item: */
        var y, i, k, s, h, sl, yl;
        s = this.parentNode.parentNode.getElementsByTagName("select")[0];
        sl = s.length;
        h = this.parentNode.previousSibling;
        for (i = 0; i < sl; i++) {
          if (s.options[i].innerHTML == this.innerHTML) {
            s.selectedIndex = i;
            h.innerHTML = this.innerHTML;
            y = this.parentNode.getElementsByClassName("same-as-selected");
            yl = y.length;
            for (k = 0; k < yl; k++) {
              y[k].removeAttribute("class");
            }
            this.setAttribute("class", "same-as-selected");
            break;
          }
        }
        h.click();
    });
    b.appendChild(c);
  }
  x[i].appendChild(b);
  a.addEventListener("click", function(e) {
    /* When the select box is clicked, close any other select boxes,
    and open/close the current select box: */
    e.stopPropagation();
    closeAllSelect(this);
    this.nextSibling.classList.toggle("select-hide");
    this.classList.toggle("select-arrow-active");
  });
}

function closeAllSelect(elmnt) {
  /* A function that will close all select boxes in the document,
  except the current select box: */
  var x, y, i, xl, yl, arrNo = [];
  x = document.getElementsByClassName("select-items");
  y = document.getElementsByClassName("select-selected");
  xl = x.length;
  yl = y.length;
  for (i = 0; i < yl; i++) {
    if (elmnt == y[i]) {
      arrNo.push(i)
    } else {
      y[i].classList.remove("select-arrow-active");
    }
  }
  for (i = 0; i < xl; i++) {
    if (arrNo.indexOf(i)) {
      x[i].classList.add("select-hide");
    }
  }
}

/* If the user clicks anywhere outside the select box,
then close all select boxes: */
document.addEventListener("click", closeAllSelect);


</script>


<script src="https://cdn.jsdelivr.net/npm/apexcharts"></script>
<script>
  
var options = {
          series: [{
            name: 'BTC',
            data: [0, 0, 0, 0, 0, 0, 0]
          }, {
          name: 'ETH',
          data: [0, 0, 0, 0, 0, 0, 0]
        }],
        dataLabels: {
    enabled: false
  },
  plotOptions: {
      bar: {
        columnWidth: "15%",
      }
    },
  legend: {
    show: false
  },
          chart: {
          type: 'bar',
          height: 150,
          stacked: true,
          stackType: '100%',
          toolbar: {
      show: false
    }
        },
        responsive: [{
          breakpoint: 480,
          options: {
            legend: {
              position: 'bottom',
              offsetX: -10,
              offsetY: 0
            }
          }
        }],
        xaxis: {
          categories: ['2018', '2019', '2020', '2021', '2022', '2023', '2024'],
         
        },
        yaxis: {
          labels: {
            show: false
  }
        },
        fill: {
          opacity: 1
        },
        legend: {
          position: 'right',
          offsetX: 0,
          offsetY: 50
        },
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
<script type="text/javascript">

$(document).ready(function(){       
    var sfoxConn = new WebSocket("wss://ws.sfox.com/ws");
    sfoxConn.onopen = function(evt) {
      var array_dta = [];
      @forelse($comdetails as $pairlist)
        var bpair = '{{ strtolower(trim($pairlist->source.'usd')) }}';        
        array_dta1 = ["ticker.sfox."+bpair];
        array_dta1.forEach(function (item) {
          array_dta.push(item);
        })
      @empty       
      var bpair = 'btcusd';
      array_dta1 = ["ticker.sfox."+bpair];
      array_dta1.forEach(function (item) {
        array_dta.push(item);
      })
      @endforelse 
      var messageJSON = {
        "type": "subscribe",
        "feeds": array_dta
      };
      sfoxConn.send(JSON.stringify(messageJSON));
    }       
    sfoxConn.onmessage = function(evt) {
      if(evt.data) {
        var get_data = JSON.parse(evt.data);
        //console.log('vinoth',get_data);
        if((get_data['payload'] )) {
          
          var data_ticker = get_data['payload']; 
          var last_price = data_ticker['last'];
          var high_price = data_ticker['high'];
          var low_price = data_ticker['low'];
          var price_change = data_ticker['amount'];
          var open_price = data_ticker['open'];
          var quote = parseFloat(data_ticker['volume']).toFixed(2);
          var symbol = data_ticker['pair'].toUpperCase();
          increase = last_price - open_price;
          price_change = (increase / open_price) * 100;
          
          var is_data = "t-red";
          if(price_change > 0) { is_data = "t-green";  }
          
          if((typeof last_price != 'undefined')) {
            $('.last_price_'+symbol).html(last_price);
          }
          
          if((typeof quote != 'undefined') && (typeof last_price != 'undefined')) {
            $('.quote_'+symbol).html(quote);
          }
          if((typeof open_price != 'undefined') && (typeof last_price != 'undefined')) {
            $('.open_'+symbol).html(open_price);
          }
          if((typeof low_price != 'undefined') && (typeof last_price != 'undefined')) {
            $('.low_'+symbol).html(low_price);
          }
          if((typeof high_price != 'undefined') && (typeof last_price != 'undefined')) {
            $('.high_'+symbol).html(high_price);
          }
          
          if((typeof price_change != 'undefined') && (typeof last_price != 'undefined')) {
            price_change = price_change * 1;
            price_change = price_change.toFixed(2);
            $('.price_change_'+symbol).html('<span class="'+is_data+'">'+parseFloat(price_change).toFixed(2)+'% </span>');
          }
          
        }
      }
      
    }
    
  });
function isNumeric(n) {
  return !isNaN(parseFloat(n)) && isFinite(n);
}
</script>




</body>
</html>
