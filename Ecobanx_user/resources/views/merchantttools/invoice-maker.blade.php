@php $title = "viewinvoice"; $atitle ="merchant";
@endphp
@include('layouts.headercss')
</section>
</header>

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
                  <h1>Invoice</h1>
               </div>

              </div>

              <section id="main-content" class="wallet-history">
<div class="wrapper main-wrapper">      
<div class="col-md-12 col-sm-12 col-xs-12">

@if(session('success'))
<div class="alert alert-success" role="alert">
<button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button><strong>Success!</strong> {{ session('success') }}
</div>
@endif
@if(session('error'))
<div class="alert alert-danger" role="alert">
<button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button><strong>Failed!</strong> {{ session('error') }}
</div>
@endif

<section class="box has-border-left-3">
<div class="content-body contb">
<header class="panel_header">
<div class="pull-right">
<a href="{{ route('invoicemaker') }}" class="btn_ac dpst-btn">Generate Invoice</a>
</div>
</header>

<div class="tab-content tabv account-sett">
<div class="tab-pane fade in active" id="wallet">
<div class="table-responsive site-scroll" data-simplebar>
<table class="table table-small-font no-mb table-borderded">
<thead>
<th>Date & Time</th>
<th>Invoice Id</th>
<th>Company Details</th>
<th>Billing Address</th>
<th>Shipping Address</th>
<th>Action</th>
</thead>
<tbody>
@forelse($category as $transaction)
<tr>
<td>{{ date('d-m-Y H:i:s', strtotime($transaction->created_at)) }}</td>
<td>{{ $transaction->invoice_id }}</td>
<td>{!! substr($transaction->companydetails,0,30) !!}...</td>
<td>{!! substr($transaction->billaddress,0,30) !!}...</td>
<td>{!! substr($transaction->shippingaddress,0,30) !!}...</td>
<td><a class="text-info" href="{{ url('/shareinvoice/'.\Hashids::encode($transaction->id)) }}" data-toggle="tooltip" title="View / Share Invoice"><i class="fa fa-eye" aria-hidden="true"></i></a> | <a class="text-primary" href="{{ url('/editinvoice/'.\Hashids::encode($transaction->id)) }}" data-toggle="tooltip" title="Edit Invoice"><i class="fa fa-pencil-square-o" aria-hidden="true"></i></a> | <a onclick="return confirm('Are you sure you want to delete this Invoice?');" class="text-danger" href="{{ url('/deleteinvoice/'.\Hashids::encode($transaction->id)) }}" data-toggle="tooltip" title="Delete Invoice"><i class="fa fa-trash" aria-hidden="true"></i></a></td>
</tr>
@empty
<tr><td colspan="9">No transaction history found!</td></tr>
@endforelse
</tbody>
</table>
@if(count($category) > 0)
{{ $category->links() }}
@endif
</div>
</div>
</div>
</div>
</section>
</div>
</div>
</section>


          
        </div>

     </div>
  </div>
</section>


<script>
function myFunction() {
  var copyText = document.getElementById("myInput");
  copyText.select();
  document.execCommand("copy");
  
  var tooltip = document.getElementById("myTooltip");
  tooltip.innerHTML = "Copied";
}
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
