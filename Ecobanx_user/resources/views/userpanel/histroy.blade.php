@php $title = "Histroy"; $atitle ="Histroy";
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
                      <div class="logo-payment"><a href="dashboard.html"><img src="img/logo.png" alt="logo"></a></div>
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
                  <h1>History</h1>
                  <p>We are on a mission to help developers like you to build beautiful projects for free.</p>
                </div>

              </div>


              <div class="dashboard-body history-body">
                   
 <div class="row">

 <div class="col-lg-2 col-xl-2 col-md-2 col-sm-12 col-xs-12"></div>

 <div class="col-lg-7 col-xl-7 col-md-12 col-sm-12 col-xs-12">
 <ul class="nav nav-pills DWT" role="tablist">
    <li class="nav-item">
      <a class="nav-link active" data-bs-toggle="pill" href="#home">Deposit History</a>
    </li>
    <li class="nav-item">
      <a class="nav-link" data-bs-toggle="pill" href="#menu1">Withdraw History</a>
    </li>
    <li class="nav-item">
      <a class="nav-link" data-bs-toggle="pill" href="#menu2">Transaction History</a>
    </li>
  </ul>
</div>

 <div class="col-lg-3 col-xl-3 col-md-12 col-sm-12 col-xs-12">
 	<div class="filter-part"><input type="text" name="coin"><button><i class="fa-solid fa-filter"></i> Filter</button></div>
 </div>

</div>

  <!-- Tab panes -->
  <div class="tab-content">
    <div id="home" class="tab-pane active">
      <div class="table-style-history-outer">
        <div class="wallet-history">
      <table class="table-style-history">
      	<tr>
      		<th>Date & Time</th>
      		<th>Tx Hash</th>
      		<th>Sender</th>
      		<th>Receiver</th>
      		<th>Deposit</th>
      		<th>Fees</th>
      		<th>Credited</th>
      		<th>Status</th>
      	</tr>
      	<tr>
      		<td></td>
      		<td></td>
      		<td></td>
      		<td></td>
      		<td></td>
      		<td></td>
      		<td></td>
      		<td></td>
      	</tr>
      </table>
      </div>
      </div>
    </div>
    <div id="menu1" class="tab-pane fade">
      <div class="table-style-history-outer">
      <table class="table-style-history">
      	<tr>
      		<th>Date & Time</th>
      		<th>Tx Hash</th>
      		<th>Sender</th>
      		<th>Receiver</th>
      		<th>Deposit</th>
      		<th>Fees</th>
      		<th>Credited</th>
      		<th>Status</th>
      	</tr>
      	<tr>
      		<td></td>
      		<td></td>
      		<td></td>
      		<td></td>
      		<td></td>
      		<td></td>
      		<td></td>
      		<td></td>
      	</tr>
      </table>
      
    </div>
    </div>
    <div id="menu2" class="tab-pane fade">
      <div class="table-style-history-outer">
      <table class="table-style-history">
      	<tr>
      		<th>Date & Time</th>
      		<th>Tx Hash</th>
      		<th>Sender</th>
      		<th>Receiver</th>
      		<th>Deposit</th>
      		<th>Fees</th>
      		<th>Credited</th>
      		<th>Status</th>
      	</tr>
      	<tr>
      		<td></td>
      		<td></td>
      		<td></td>
      		<td></td>
      		<td></td>
      		<td></td>
      		<td></td>
      		<td></td>
      	</tr>
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
          name: 'PRODUCT A',
          data: [44, 55, 41, 67]
        }, {
          name: 'PRODUCT B',
          data: [13, 23, 20, 8]
        }],
        dataLabels: {
    enabled: false
  },
  legend: {
    show: false
  },
          chart: {
          type: 'bar',
          height: 225,
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
          categories: ['2011', '2012', '2013', '2014'],
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

</body>
</html>
