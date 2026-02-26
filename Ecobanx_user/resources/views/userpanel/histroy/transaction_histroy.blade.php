@php $title = "Transaction History"; $atitle ="Histroy";
@endphp
@include('layouts.headercss')

<section class="Dashboard-page">
    <div class="container-fluid">
        <div class="row">

            @include('layouts.menu')

            <div class="col-lg-10 col-xl-10 col-md-12 col-sm-12 col-xs-12">

                <div class="header-part-outer">

                    <div class="head-title-part">
                        <h1>Transaction History</h1>
                    </div>

                </div>


                <div class="dashboard-body history-body">

                    <div class="row">

                        <!-- <div class="col-lg-3 col-xl-3 col-md-2 col-sm-12 col-xs-12"></div> -->

                        <div class="col-lg-12 col-xl-12 col-md-12 col-sm-12 col-xs-12">
                            <ul class="nav nav-pills DWT" role="tablist">
                                <li class="nav-item">
                                    <a class="nav-link ar3" href="{{ url('deposit-history/BTC') }}">Deposit History</a>
                                </li>
                                <li class="nav-item">
                                    <a class="nav-link ar3" href="{{ url('withdrawhistroy/BTC') }}">Withdraw History</a>
                                </li>
                                <li class="nav-item ar3">
                                    <a class="nav-link active" data-bs-toggle="pill"
                                        href="{{ route('accounthistroy') }}">Transaction History</a>
                                </li>
                            </ul>
                        </div>

                    </div>

                    <!-- Tab panes -->
                    <div class="tab-content">
                        <div id="home" class="tab-pane active">
                            <div class="transaction-history">
                                <div class="table-responsive site-scroll-d history" data-simplebar>
                                    <table class="table table-small-font no-mb table-borderded ">
                                        <thead class="history">
                                            <tr>
                                                <th>S.No</th>
                                                <th>Date and Time</th>
                                                <th>Received/Sent </th>
                                                <th>Name</th>
                                                <th>Coin</th>
                                                <th>Amount</th>
                                                <th>Status</th>

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
                                                @if(isset($transaction->BuyerInformation['first_name']))
                                                <td>{{ $transaction->BuyerInformation['first_name'] }}
                                                    {{ $transaction->BuyerInformation['last_name'] }}</td>
                                                @else
                                                <td>POS Deposit</td>
                                                @endif
                                                <td>{{ $transaction->currency1 }}</td>
                                                <td>{{ number_format($transaction->amount1, 8, '.', '') }}</td>
                                                <td>
                                                    @if($transaction->status == 0)
                                                    <a href="{{ url('/trans_view/'.$transaction->txn_id) }}">Waiting</a>
                                                    @elseif($transaction->status == -1)

                                                    <a href="{{ url('/trans_view/'.$transaction->txn_id) }}"> Cancelled
                                                    </a>

                                                    @elseif($transaction->status == 1)
                                                    <a
                                                        href="{{ url('/trans_view/'.$transaction->txn_id) }}">Confirmed</a>
                                                    @elseif($transaction->status == 2)
                                                    <a href="{{ url('/trans_view/'.$transaction->txn_id) }}">Queued</a>

                                                    @elseif($transaction->status == 100)
                                                    <a
                                                        href="{{ url('/trans_view/'.$transaction->txn_id) }}">Completed</a>
                                                    @endif

                                                </td>

                                            </tr>
                                            @php
                                            $i ++ ;@endphp
                                            @endforeach
                                            @else
                                            <tr>
                                                <td colspan="8" class="text-center">
                                                    <div class="transaction-details">
                                                        <span>Record not found !</span>
                                                    </div>
                                                </td>
                                            </tr>
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
$(document).ready(function() {

    $('.extras').click(function() {

        $('.profile-list').toggleClass('showing')

    });

    $('.more-menu-bottom').click(function() {

        $('.extra-menu-mobile').toggleClass('showall-extramenus')

    })

})
</script>

</body>

</html>