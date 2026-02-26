@php
$atitle ="feewallet";
@endphp

@extends('layouts.header')
@section('title', 'Admin Wallet')
@section('content')
<section class="content">
  <div class="content__inner">
    <header class="content__title">
      <h1>{{ $coin }} Withdrawal Wallet</h1>
    </header>
    @if(session('status'))
        <div class="alert alert-success">
          {{ session('status') }}
        </div>
    @endif

    <div class="card">
      <div class="card-body">
        <div class="row">
          <div class="col-md-3">
              <div class="form-group">
                <label>Select Withdraw Asset</label>
              </div>
            </div>

        <div class="col-md-3">
          <select onchange="location = this.value;" class="form-control custom-s text-left" >

              <option value="{{ url('admin/feewallet/'.$coin) }}"  disabled>{{ $coin }}</option>

              @foreach($coinlists as $coinlist)
                <option value="{{ url('admin/feewallet/'.$coinlist->source.'/'.$coinlist->type) }}" @if($coin == $coinlist->source && $coinlist->type == $type) selected @endif>{{ $coinlist->source }} ({{ ucfirst($coinlist->assertype) }})</option>

              @endforeach
            </select>
        </div>
        <div class="col-md-3">
              <div class="form-group">
                <!-- <form action="{{ url('/admin/feewalletedit') }}" method="post">
                 {{ csrf_field() }}
                   <input type="hidden" name="coin" value="{{ $coin }}">
                   <input type="hidden" name="pvk" value="{{ $pvk }}">
                   <input type="hidden" name="fromaddress" value="{{ $data->address }}"> -->

          @if(in_array("write", explode(',',$AdminProfiledetails->adminwallet)))

                  <a href="{{ url('admin/feewalletedit'). '/'.Crypt::encrypt($data->id) }}" name="edit" class="btn btn-light"><i class=""></i> Edit</a>
                @endif
                <!-- </form> -->
              </div>
            </div>

      </div>
        <form method="POST" action="{{ url('admin/cryptosendamount') }}" id="theform">
          @if (Session::has('success'))
           <div class="alert alert-info">{{ Session::get('success') }}</div>
          @elseif (Session::has('error'))
           <div class="alert alert-danger">{{ Session::get('error') }}</div>
          @endif
        {{ csrf_field() }}
          <div class="row">
            <div class="col-md-3">
              <div class="form-group">
                <label>Coin</label>
              </div>
            </div>
            <div class="col-md-4">
              <input type="hidden" name="id" class="form-control" value="{{ Crypt::encrypt($data->id) }}" readonly>

              <div class="form-group">
                <input type="text" name="coinname" class="form-control" value="{{ $coin }}" readonly>
                <i class="form-group__bar"></i> </div>
            </div>
          </div>
          <div class="row">
            <div class="col-md-3">
              <div class="form-group">
                <label>From Address</label>
              </div>
            </div>
            <div class="col-md-5">
              <div class="input-group">
                <input type="text" name="fromaddress" class="form-control" value="{{ $data->address }}" id="myInput" /><div class="input-group-append">
                <span class="input-group-text btn btn-warning" id="basic-addon2" onclick="myFunction()">Click to Copy</span>
              </div>

                <i class="form-group__bar"></i> </div>
            </div>
          </div>




          <div class="row">
            <div class="col-md-3">
              <div class="form-group">
                <label>Total Balance</label>
              </div>
            </div>
            <div class="col-md-4">
              <div class="form-group">
                <input type="text" name="balance" class="form-control" value="{{ display_format($data->balance,8) }}" readonly="">
                <i class="form-group__bar"></i> </div>
            </div>
          </div>
           <div class="row">
            <div class="col-md-3">
              <div class="form-group">
                <label>To Address</label>
              </div>
            </div>
            <div class="col-md-5">
              <div class="form-group">
                <input type="text" name="toaddress" class="form-control" value="">
                <i class="form-group__bar"></i> </div>
                @if ($errors->has('toaddress'))
                <span class="help-block">
                <strong class="text text-danger">{{ $errors->first('toaddress') }}</strong>
                </span>
                @endif
            </div>
          </div>
          <div class="row">
            <div class="col-md-3">
              <div class="form-group">
                <label>Amount</label>
              </div>
            </div>
            <div class="col-md-5">
              <div class="form-group">
                <input type="text" name="amount" class="form-control" value="">
                <i class="form-group__bar"></i> </div>
                @if ($errors->has('amount'))
                <span class="help-block">
                <strong class="text text-danger">{{ $errors->first('amount') }}</strong>
                </span>
                @endif
            </div>
          </div>
          @if(in_array("write", explode(',',$AdminProfiledetails->adminwallet)))
           <div class="form-group">
              <button type="submit" name="edit" class="btn btn-light"><i class=""></i> Submit</button>
            </div>
            @endif
        <hr>
        <h4>Transaction Histroy:-</h4>
        <hr>
        <div class="table-responsive search_result">
        <table class="table" id="dows">
          <thead>
            <tr>
              <th>S.No</th>
              <th>Date</th>
              <th>Type</th>
              <th>Txn ID</th>
              <th>Recipient</th>
              <th>Sender</th>
              <th>Amount</th>
            </tr>
          </thead>
          <tbody>
            @if($depositList->count())
            @php
            $limit=10;
            $i=1;
            if(isset($_GET['page'])){
            $page = $_GET['page'];
            $i = (($limit * $page) - $limit)+1;
          }else{
          $i =1;
        }
        if($coin == 'ETH' || $type == 'erctoken'){
          $url = "https://etherscan.io/tx/";
        }else if($coin == 'BNB' || $type == 'bsctoken'){
          $url = "https://bscscan.com/tx/";
        }else if($coin == 'MATIC' || $type == 'polytoken'){
          $url = "https://polygonscan.com/tx/";
        } else if($coin == 'TRX' || $type == 'trxtoken'){
          $url = "https://tronscan.org/#/transaction/";
        } else if($coin == 'BTC'){
          $url = "https://live.blockcypher.com/btc/tx/";
        } else if($coin == 'LTC'){
          $url = "https://live.blockcypher.com/ltc/tx/";
        } else if($coin == 'XRP'){
          $url = "https://bithomp.com/explorer/";
        }else{
          $url = "https://etherscan.io/tx/";
        }

      @endphp

      @foreach($depositList as $key => $histroy)
      <tr>
        <td>{{ $i }}</td>
        <td>{{ date('d-m-Y h:i:s', strtotime($histroy->created_at)) }}</td>
        <td>{{ $histroy['txtype'] !="" ? $histroy['txtype'] : '-' }}</td>
        <td><a href="{{ $url.$histroy['txid'] }}" target="_blank">{{ $histroy['txid'] !="" ? mb_strimwidth($histroy['txid'], 0, 20, "...") : '-' }}</a></td>

        <td>{{ $histroy['to_addr'] !="" ? $histroy['to_addr'] : '-' }}</td>
        <td>{{ $histroy['from_addr'] !="" ? $histroy['from_addr'] : '-' }}</td>
        <td>{{ display_format($histroy->amount,8) }}</td>
      </tr>
      @php $i++; @endphp
      @endforeach
      @else
      <td colspan="7">  {{ 'No record found! ' }}</td>
      @endif
    </tbody>
  </table>

  <div class="col-md-12 col-sm-12 col-xs-12 nopadding">
    <div class="pagination-tt clearfix">
      @if($depositList->count())
      {{ $depositList->links() }}
      @endif
    </div>
  </div>

</div>
      </div>
    </div>
  </div>
</section>
  @endsection
  <script type="text/javascript">
    function myFunction() {
      var copyText = document.getElementById("myInput");
      copyText.select();
      copyText.setSelectionRange(0, 99999);
      document.execCommand("copy");
      document.getElementById("myInput").innerHTML = html;

    }
  </script>
