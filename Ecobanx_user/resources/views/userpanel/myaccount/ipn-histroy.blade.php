<!@php $title = "IPN History";
  $atitle = "IPN-History";
@endphp @include('layouts.headercss')

  <section class="Dashboard-page">
    <div class="container-fluid">
      <div class="row">

        @include('layouts.menu')


        <div class="col-lg-10 col-xl-10 col-md-12 col-sm-12 col-xs-12">

          <div class="header-part-outer">

            <div class="head-title-part">
              <h1>IPN History</h1>
            </div>

          </div>


          <div class="dashboard-body wallet-body api-keys-body">

            <div class="row">
              @if (session('sucess_msg'))
          <div class="alert alert-success alert-dismissible" role="alert">
          <button type="button" class="close" data-dismiss="alert" aria-label="Close"><span
            aria-hidden="true">&times;</span></button><strong>Success!</strong> {{ session('sucess_msg') }}
          </div>
        @endif


              @if (session('error_msg'))
          <div class="alert alert-danger alert-dismissible" role="alert">
          <button type="button" class="close" data-dismiss="alert" aria-label="Close"><span
            aria-hidden="true">&times;</span></button><strong>Error!</strong> {{ session('error_msg') }}
          </div>
        @endif

              <div class="col-lg-12 col-xl-12 col-md-12 col-sm-12 col-xs-12">
                <div class="wallet-history api-keys-table-part">
                  <div class="api-keys-table-part-inner">
                    <table class="table-style-history table table-responsive ipn-history-table">
                      <thead>
                        <tr>
                          <th>SNO</th>
                          <th>Time Created</th>
                          <th>Type</th>
                          <th>Payment/Txn ID</th>
                          <th>Status</th>
                          <th>Sent Url</th>
                          <th>Last Sent</th>
                          <th>Resend</th>
                        </tr>
                      </thead>
                      <tbody>
                        @php $i = 1; @endphp
                        @forelse($history as $transaction)
              <tr>
                <td>{{ $i }}</td>
                <td>{{ date('Y-m-d H:i:s', strtotime($transaction->created_at)) }}</td>
                <td>{{ $transaction->type }} </td>
                <td>{{ $transaction->txn_id }} </td>
                <td>{{ $transaction->status }} </td>
                <td>
                <p title="{{ $transaction->ipn_url }}">
                  <?php  echo mb_strimwidth($transaction->ipn_url, 0, 15, '...');?></p>
                </td>
                <td>{{ date('Y-m-d H:i:s', strtotime($transaction->updated_at)) }}</td>

                <td>
                <a href="{{ url('/resentOrderTrans/' . $transaction->orderid) }}">Resent</a>
                </td>
              </tr>
              @php  $i++; @endphp
            @empty
        <tr>
          <td colspan="8" class="text-center">
          <div class="transaction-details">
            <span>Record not found !</span>
          </div>
          </td>
        </tr>
      @endforelse
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

    $(document).ready(function () {

      $('.extras').click(function () {

        $('.profile-list').toggleClass('showing')

      });

      $('.more-menu-bottom').click(function () {

        $('.extra-menu-mobile').toggleClass('showall-extramenus')

      })

    });

  </script>

  </body>

  </html>