@php
$atitle ="adminwallet";
@endphp
@extends('layouts.header')
@section('title', 'Admin Wallet Settings')
@section('content')
<section class="content">
  <div class="content__inner">
    <header class="content__title">
      <h1>Admin Wallet Settings</h1>
    </header>
    <div class="row">
      <div class="col-md-12">
        <div class="card">
          <div class="card-body">
            <div class="table-responsive">
              <table class="table">
                <thead>
                  <tr>
                    <th>S.No</th>
                    <th>Coin / Currency</th>
                    <th>Address</th>
                    <th>Balance</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody> 
                @forelse($adminwallet as $key => $adminwallets)
                  <tr>
                    <td>{{ $key+1 }}</td>
                    <td>{{ $adminwallets->coin_name }}</td>
                    <td>{{ $adminwallets->address }}</td>
                    <td>{{ $adminwallets->balance }}</td>
                    <td><a href="{{ url('/admin/adminwalletssettings', Crypt::encrypt($adminwallets->id)) }}" class="btn btn-info">View</a></td>
                  </tr>
                  @empty
                   <tr><td colspan="7"> {{ 'No Wallet History' }}!</td></tr>
                @endforelse
                </tbody>
              </table>
              {{ $adminwallet->links() }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
@endsection