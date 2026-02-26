@php $title = "Merchant Setting"; $atitle ="Account";
@endphp
@include('layouts.headercss')
  
<section class="Dashboard-page">
  <div class="container-fluid">
     <div class="row">

      @include('layouts.menu')


        <div class="col-lg-10 col-xl-10 col-md-12 col-sm-12 col-xs-12">

               <div class="header-part-outer">

                <div class="head-title-part">
                  <h1>Merchant Settings</h1>
                </div>

              </div>


              <div class="account-setting-body">


                <ul class="nav nav-pills" role="tablist">
                <li class="nav-item">
                <a class="nav-link" href="{{ route('basicsetting') }}">Basic Setting</a>
                </li>
                <li class="nav-item">
                <a class="nav-link active"  data-bs-toggle="pill" href="{{ route('merchantsetting') }}">Merchant Setting</a>
                </li>
                </ul>

                <!-- Tab panes -->
                <div class="tab-content">     


                <div id="menu1" class="tab-pane active">
                <h3>Merchant Setting</h3>
                <div class="row">

                  <div class="col-lg-7 col-xl-7 col-md-7 col-sm-12 col-xs-12">
                  	@if (session('success'))
					<div class="alert alert-success">
					{{ session('success') }}
					</div>
					@endif
                    <form class="form-container" method="POST" action="{{ url('/merchant-setting-create') }}">
						{{ csrf_field() }}

                    <div class="merchant-setting-flex">

                    <div class="form-group">  
                    <label>IPN Secret *</label>
                    <input type="text" class="form-control" name="ipn_secret" value="{{ isset($datas->ipn_secret) ? $datas->ipn_secret : ''}}">
                    <span>This is used to verify that an IPN is from us, use a good random string nobody can guess.</span>
                    @if ($errors->has('ipn_secret'))
					<strong class="text text-danger">{{ $errors->first('ipn_secret') }}</strong>
					@endif
                    </div>

                    <div class="form-group">
                    <label>IPN URL </label>
                    <input type="text" class="form-control" name="ipn_url" value="{{ isset($datas->ipn_url) ? $datas->ipn_url : ''}}">
                    <span>HTTPS URL recommended (self-signed certs OK).</span>
                    @if ($errors->has('ipn_url'))
					<strong class="text text-danger">{{ $errors->first('ipn_url') }}</strong>
					@endif
                    </div>

                    <div class="form-group">
                    <label>Callback Deposit IPN Coin/Currency </label>
                    <select class="form-control" name="coin" >
						<option value="">All coin</option>
						@foreach($commission as $val)
						<option value="{{ $val->id }}" @if(isset($datas->coin) && $datas->coin == $val->id ) selected @endif>{{ $val->source }} @if($val->assertype !='coin') ({{ $val->assertype }}) @endif</option>
						@endforeach
					</select>
					@if ($errors->has('coin'))
					<strong class="text text-danger">{{ $errors->first('coin') }}</strong>
					@endif
                    </div>

                    <div class="form-group">
                      <label>Status/Log Email</label>
                      <input type="text" class="form-control" name="status" value="{{ isset($datas->status_email) ? $datas->status_email : ''}}">
                      <span>If set payment status emails and positive feedback notifications will be sent to this email address. Otherwise they will be  sent to your primary email address.</span>
                      @if ($errors->has('status'))
						<strong class="text text-danger">{{ $errors->first('status') }}</strong>
						@endif
                      </div>

                    </div>
                    @php
                    if(isset($datas['receive_mail'])){
				 		$receive_mail=explode(",",$datas['receive_mail']);
                    }
				 	else{
				 		$receive_mail=array();
				 	}				 	

					@endphp	
                    <div class="form-group">
                    <label>When To Receive Emails</label>
                    <div class="form-group receive-email" style="margin-bottom: 0px;">
                      <input type="checkbox" name="receive_mail[]" value="1" @if (in_array(1,$receive_mail)) checked @endif><label>When a user submits a new payment to you</label>
                    </div>
                    <div class="form-group receive-email" style="margin-bottom: 0px;">
                      <input name="receive_mail[]" value="2" type="checkbox" @if (in_array(2, $receive_mail)) checked @endif ><label>When funds have been received by us for a payment to you</label>
                    </div>
                    <div class="form-group receive-email" style="margin-bottom: 0px;">
                      <input name="receive_mail[]" value="3" type="checkbox" @if (in_array(3, $receive_mail)) checked @endif ><label>When funds for a payment have been sent to you</label>
                    </div>
                    <div class="form-group receive-email" style="margin-bottom: 0px;">
                      <input name="receive_mail[]" value="4" type="checkbox" @if (in_array(4, $receive_mail)) checked @endif ><label>When a deposit is received on one of your deposit addresses</label>
                    </div>
                    @if ($errors->has('receive_mail'))
					<strong class="text text-danger">{{ $errors->first('receive_mail') }}</strong>
					@endif
                    </div>
                    <div class="Update-Settings merchant-settings-btns"><button>Update Settings</button></div>
                    </form>

                    
                  </div>

                  <div class="col-lg-5 col-xl-5 col-md-5 col-sm-12 col-xs-12">
                    <div class="bassic-setting-img"><img src="{{ url('img/bassic-setting-img.png') }}"></div>
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
