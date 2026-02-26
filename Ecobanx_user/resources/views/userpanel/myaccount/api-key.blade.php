@php $title = "API Key"; $atitle ="APIKEY";
@endphp
@include('layouts.headercss')

<section class="Dashboard-page">
  <div class="container-fluid">
   <div class="row">

    @include('layouts.menu')


    <div class="col-lg-10 col-xl-10 col-md-12 col-sm-12 col-xs-12">

     <div class="header-part-outer">
      <div class="head-title-part">
        <h1>API Keys({{ $count }}/10)</h1>
      </div>

    </div>
    @if ($message =Session::get('success'))
      <div class="snackbar show" role="alert"><i class="fa fa-check-circle text-success"></i> {{ $message }}</div>
    @endif
    @if ($message = Session::get('error'))
      <div class="snackbar show" role="alert"><i class="fa fa-times-circle text-danger"></i>{{ $message }}</div>
    @endif

    <div class="dashboard-body wallet-body api-keys-body">

     <div class="row">
      <div class="col-lg-12 col-xl-12 col-md-12 col-sm-12 col-xs-12">
        <form method="POST" action="{{ url('/api-remove') }}">
                {{ csrf_field() }}
        <div class="wallet-history api-keys-table-part">
          <div class="api-keys-table-part-inner">
            <table class="table-style-history table table-responsive api-keys-table">
              <tr>
                <th>#</th>
                <th>Date & Time</th>
                <th>Key Name</th>
                <th>Public Key</th>
                <th>Private Key</th>
                <th>Action</th>
              </tr>
              @forelse($datas as $data)
              <tr>
                <td><label class="checkcont"><input type="checkbox" value="{{ \Hashids::encode($data->id) }}" name="checkedremove[]" /> <span class="checkmark"></span></label></td>
                <td><div class="mwc-inner"><span>{{ date('M d,Y H:i:s A',strtotime($data->created_at)) }}</span></div></td>
                <td><span class="balance-span">{{ $data->apidetails['key_name'] !=""? $data->apidetails->key_name : 'Unnamed API Key'}}</span></td>
                <td><div class="Public-Key"><input id="publickey{{$data->id}}" value="{{ $data->public_key  }}" type="password" name="Public-Key"></div></td>
                <td><div class="Private-Key"><input id="privatekey{{$data->id}}" value="{{ $data->private_key  }}" type="password" name="Private-Key"></div></td>
                <td>
                  <a href="{{ url('edit-key/'.\Hashids::encode($data->id)) }}" class="edit-key" title="Edit Permissions" data-toggle="tooltip" data-placement="top"><i class="fa-solid fa-pen-to-square"></i> </a>
                  <a class="del-key" href="{{ url('delete-apikey/'.\Hashids::encode($data->id)) }}" title="Delete" data-toggle="tooltip" data-placement="top"><i class="fa-solid fa-trash-can"></i> </a>
                  <a href="#" class="show-keys-key " onClick="getPasswordResponse({{$data->id}})"><span id="passtexticon{{$data->id}}"><i class="fa-regular fa-eye" ></i></span> Show keys</a></td>
              </tr>
              @empty
              <tr><td colspan="8" class="text-center"><div class="transaction-details">
              <span>Record not found !</span>
            </div></td></tr>
              @endforelse
            </table>
          </div>
          <div class="two-buttons-space-btwn">
            <a class="gen-new-key"  href="{{ route('addapi') }}" >Generate new key</a>
            <button class="withdraw-cls" type="submit"><i class="fa-solid fa-trash-can"></i> Delete Selected Keys</button></div>


          </div>
        </form>
        </div>

      </div>

    </div>

  </div>

</div>
</div>
</section>
<script>

  $(document).ready(function(){
    setTimeout(() => {
      $('.snackbar').remove();
    }, 3000);
   $('.more-menu-bottom').click(function(){

    $('.extra-menu-mobile').toggleClass('showall-extramenus')

  });

   $('.extras').click(function(){

    $('.profile-list').toggleClass('showing')

  });

 });
  function getPasswordResponse(id) {
    var password_repsonse = document.getElementById("publickey"+id);
    var privatekey_repsonse = document.getElementById("privatekey"+id);
    if (password_repsonse.getAttribute('type') === "password") {
      password_repsonse.setAttribute('type', 'text');
      privatekey_repsonse.setAttribute('type', 'text');
      document.getElementById("passtexticon"+id).innerHTML = '<i class="fa fa-eye" aria-hidden="true"></i>';
    } else {
      password_repsonse.setAttribute('type', 'password');
      privatekey_repsonse.setAttribute('type', 'password');
      document.getElementById("passtexticon"+id).innerHTML = '<i class="fa fa-eye-slash" aria-hidden="true"></i>';
    }
  }

</script>

</body>
</html>
