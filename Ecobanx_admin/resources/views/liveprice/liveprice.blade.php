@extends('layouts.header')
@section('title', 'Commission Settings')
@section('content')
<section class="content">
  <div class="content__inner">
    <header class="content__title">
      <h1>Live Price Setting For NGN</h1>
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
                    <th>Coin Details</th>
                    <th>Live Price</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody> 
                  <tr>
                    <td>1</td>
                    <td>1 BTC in NGN </td>
                    <td>{{$ngnliveprice}}</td>
                    <td><a href="{{ url('/admin/updatengnval') }}" class="btn btn-info">Update</a></td>
                  </tr>
                </tbody>
              </table>
             </div>
          
          </div>

        </div>
      </div>
    </div>
  </section>
@endsection