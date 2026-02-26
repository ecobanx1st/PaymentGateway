@extends('layouts.header')
@section('title', 'Admin Wallet')
@section('content')
<section class="content">
  <div class="content__inner">
    <header class="content__title">
      <h1>Token Fee Wallet</h1>
    </header>
    @if(session('status'))
        <div class="alert alert-success">
          {{ session('status') }}
        </div>
    @endif
    <div class="card">
      <div class="card-body">
        <form method="POST" action="{{ url('admin/walletupdate') }}" id="theform">
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
                <input type="text" name="coinname" class="form-control" value="{{ $data-> coinname }}" readonly>
                <i class="form-group__bar"></i> </div>
            </div>
          </div>
          <div class="row">
            <div class="col-md-3">
              <div class="form-group">
                <label>Address</label>
              </div>
            </div>
            <div class="col-md-5">
              <div class="input-group">
                <input type="text" name="address" class="form-control" value="{{ $data->address }}" id="myInput" /><div class="input-group-append">
                <span class="input-group-text btn btn-warning" id="basic-addon2" onclick="myFunction()">Click to Copy</span>
              </div>

                <i class="form-group__bar"></i> </div>
            </div>
          </div>
               
          <div class="row">
            <div class="col-md-3">
              <div class="form-group">
                <label>Private Key</label>
              </div>
            </div>
            <div class="col-md-5">
              <div class="form-group">
                <input type="text" name="balance" class="form-control" value="{{ $pvk }}" readonly="">
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
                <input type="number" name="balance" class="form-control" value="{{ $data->balance }}" readonly="">
                <i class="form-group__bar"></i> </div>
            </div>
          </div>
          <!-- 
           <div class="form-group">
              <button type="submit" name="edit" class="btn btn-light"><i class=""></i> Update</button>
            </div> -->
        </form>
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
        
        $url = "https://etherscan.io/tx/";
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