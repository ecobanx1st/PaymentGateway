@php $title = "Deposit History"; $atitle ="Histroy";
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

       <!-- <div class="col-lg-3 col-xl-3 col-md-2 col-sm-12 col-xs-12"></div> -->

       <div class="col-lg-12 col-xl-12 col-md-12 col-sm-12 col-xs-12">
         <ul class="nav nav-pills DWT" role="tablist">
          <li class="nav-item">
            <a class="nav-link active" data-bs-toggle="pill" href="{{ url('deposit-history/BTC') }}">Deposit History</a>
          </li>
          <li class="nav-item">
            <a class="nav-link ar3" href="{{ url('withdrawhistroy/BTC') }}">Withdraw History</a>
          </li>
          <li class="nav-item">
            <a class="nav-link ar3" href="{{ route('accounthistroy') }}">Transaction History</a>
          </li>
        </ul>
      </div>

      <div class="col-lg-3 col-xl-3 col-md-12 col-sm-12 col-xs-12">
        <div class="filter-part">
          <select class="form-control custom-s" onchange="location = this.value;">
            @foreach ($lists as $list)
            <option @if($currency == $list->source) selected="" @endif value="{{ $list->source }}">{{ $list->source }}</option>
            @endforeach
          </select>
        </div>
      </div>

    </div>

    <!-- Tab panes -->
    <div class="tab-content">
      <div id="home" class="tab-pane active">
      <div class="table-style-history-outer history">
      <table class="table-style-history">
            <thead class="history">
              <tr>
                <th>S.No</th>
                <th>Date & Time</th>
                <th>Txn ID</th>
                <th>From Address</th>
                <th>To Address</th>
                <th>Amount ({{$currency}})</th>
                <th>Fee</th>
                <th>Satoshis amount</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody class="history">
              @php $i = 1; @endphp
              @forelse($datas as $transaction)
              <tr>
                <td>{{ $i }}</td>
                <td>{{ date('d-m-Y H:i:s', strtotime($transaction->created_at)) }}</td>
                <td>{{ $transaction->txn_id }}</td>
                <td>{{ $transaction->from_address }}</td>
                <td>{{ $transaction->to_address }}</td>
                <td>{{ number_format($transaction->amount, 8, '.', '') }}</td>
                <td>{{ display_format($transaction->fee) }}</td>
                <td>{{ $transaction->amounti ? display_format($transaction->amounti) :'0' }}</td>
                <td>
                  {{ $transaction->status_text }}
                </td>
              </tr>
              @php
              $i ++ ;@endphp
              @empty
              <tr><td colspan="10" class="text-center"><div class="transaction-details">                           
              <span>Record not found !</span>
            </div></tr>
              @endforelse
            </tbody>
          </table>
          @if(count($datas) > 0)
          {{ $datas->links() }}
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
