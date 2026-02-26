@php $title = "Payment Scan"; $atitle ="merchant";
@endphp
@include('layouts.headercss')
</section>
</header>

<section class="paymentstepsbg">
    <div class="container">
        <div class="row">
            <div class="stepsbanner">
                <div class="logo text-center">
                    <a href="{{ url('/') }}">
                        <img src="{{ url('img/logo.png') }}" alt="logo" width="120px">
                    </a>
                </div>
            </div>
            <div class="col-md-10 col-sm-12 col-xs-12 center-content securitybox">
                <h3 class="text-center fnt-bld inner-heading">Payment Success</h3>
                <hr class="x-linef">
                <div class="form-container mt-30">
                    <div class="table-responsive" data-simplebar>
                        <table class="table table-small-font no-mb table-borderded">
                            <thead>
                                <tr>
                                    <th colspan="2" class="text-center">Payment Information</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td class="text-right">Status :</td>
                                    <td>{{ $orders->status_text  }}</td>
                                </tr>
                                <tr>
                                    <td class="text-right">Total Amount To Send :</td>
                                    <td>{{ $orders->received_amount  }} {{ $orders->currency2  }}</td>
                                </tr>

                                <tr>
                                    <td class="text-right">Payment ID :</td>
                                    <td>{{ $orders->txn_id  }}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                <div class="form-container mt-30">
                    <div class="table-responsive" data-simplebar>
                        <table class="table table-small-font no-mb table-borderded">
                            <thead>
                                <tr>
                                    <th colspan="2" class="text-center">Transaction Details</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td class="text-right">Transaction ID :</td>
                                    <td>{{ $orders->txn_id  }}</td>
                                </tr>
                                <tr>
                                    <td class="text-right">Time Submitted :</td>
                                    <td>{{ date('d-m-Y H:i:s', strtotime($orders->created_at)) }}</td>
                                </tr>

                                <tr>
                                    <td class="text-right">Status :</td>
                                    <td>{{ $orders->status_text  }}</td>
                                </tr>

                                <tr>
                                    <td class="text-right">Amount :</td>
                                    <td>{{ $orders->amount1  }}{{ $orders->currency1  }}</td>
                                </tr>


                                <tr>
                                    <td class="text-right">Fee :</td>
                                    <td>{{ $orders->fee ? $orders->fee :'-' }}</td>
                                </tr>

                                <tr>
                                    <td class="text-right">Sender :</td>
                                    <td>{{ $user->name ? $user->name :'-' }}</td>
                                </tr>

                                <tr>
                                    <td class="text-right">Sender's Email :</td>
                                    <td>{{ $user->email ? $user->email :'-' }}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
</section>
</article>
<footer>
    <section class="footer-gray-bg">
        <div class="container">
            <div class="footer-contnet">
                <div class="col-md-12 col-sm-12 col-xs-12 ftext">
                    <p class="t-white text-center">Copyright &copy; @php echo date('Y'); @endphp WFI. All Rights
                        Reserved</p>
                </div>

            </div>
        </div>

    </section>
</footer>