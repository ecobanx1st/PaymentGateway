@php $title = "Payment Invoice history"; $atitle ="Histroy";
@endphp
@include('layouts.headercss')

<section class="Dashboard-page">
  <div class="container-fluid">
   <div class="row">

    @include('layouts.menu')

    <div class="col-lg-10 col-xl-10 col-md-12 col-sm-12 col-xs-12">

     <div class="header-part-outer">

      <div class="head-title-part">
        <h1>Deposit History</h1>
      </div>

    </div>


    <div class="dashboard-body history-body">

     <div class="row">

       <div class="col-lg-9 col-xl-9 col-md-12 col-sm-12 col-xs-12">
         <ul class="nav nav-pills DWT" role="tablist">
          <li class="nav-item">
            <a class="nav-link" data-bs-toggle="pill" href="{{ url('deposit-history/BTC') }}">Deposit History</a>
          </li>
          <li class="nav-item">
            <a class="nav-link" href="{{ url('withdrawhistroy/BTC') }}">Withdraw History</a>
          </li>
          <li class="nav-item">
            <a class="nav-link" href="{{ route('accounthistroy') }}">Transaction History</a>
          </li>
          <li class="nav-item">
            <a class="nav-link active" href="{{ route('accounthistroy') }}">Payment Invoice history</a>
          </li>
        </ul>
      </div>

      <div class="col-lg-3 col-xl-3 col-md-12 col-sm-12 col-xs-12">
        <div class="filter-part">
         <!-- <div class="pull-right">
			<a href="{{ route('requestinvoicemaker') }}" class="btn_ac dpst-btn">Generate Request Invoice</a>
			</div> -->
        </div>
      </div>

    </div>

    <!-- Tab panes -->
    <div class="tab-content">
      <div id="home" class="tab-pane active">
      <div class="table-style-history-outer history">
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
      <table class="table-style-history">
            <thead class="history">
              <tr>
                <th>S.No</th>
                <th>Date & Time</th>
				<th>Customer</th>
				<th>Company Details</th>
				<th>Amount</th>
				<th>Action</th>
              </tr>
            </thead>
            <tbody class="history">
              @php $i = 1; @endphp
              @forelse($category as $transaction)
				<tr>
				<td>{{ $i }}</td>
				<td>{{ date('d-m-Y H:i:s', strtotime($transaction->created_at)) }}</td>
				<td>{{ $transaction->customername }}</td>
				<td>{!! substr($transaction->companydetails,0,30) !!}...</td>
				<td>{{ $transaction->payment_checkamt }} {{ $transaction->cointwo }}</td>
				<td><a class="text-info" href="{{ url('/shareinvoice/'.\Hashids::encode($transaction->id)) }}" data-toggle="tooltip" title="View / Share Invoice"><i class="fa fa-eye" aria-hidden="true"></i></a> | <a class="text-primary" href="{{ url('/editrequestinvoice/'.\Hashids::encode($transaction->id)) }}" data-toggle="tooltip" title="Edit Invoice"><i class="fa fa-pencil-square-o" aria-hidden="true"></i></a> | <a onclick="return confirm('Are you sure you want to delete this Invoice?');" class="text-danger" href="{{ url('/deleteinvoice/'.\Hashids::encode($transaction->id)) }}" data-toggle="tooltip" title="Delete Invoice"><i class="fa fa-trash" aria-hidden="true"></i></a></td>
				</tr>
				@php $i ++; @endphp
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

</div>

</div>
</div>
</section>





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