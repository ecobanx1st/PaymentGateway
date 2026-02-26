@php
$atitle ="commission";
@endphp
@extends('layouts.header')
@section('title', 'Commission Settings')
@section('content')
<section class="content">
  <div class="content__inner">
    <header class="content__title">
      <h1>Commission Settings</h1>
    </header>
    <div class="row">
      <div class="col-md-12">
        <div class="card">
          <div class="card-body">
            <div class="row">
                <div class="col-md-6">
                    <form action="{{ url('admin/commission') }}/filter" method="get">
                        {{ csrf_field() }}
                        <select name="searchphrase" class="form-control" id="searchphrase">
                        <option value="">Select Coin</option>
                        @foreach (list_coin() as $key => $val)
                            <option value="{{ $val->source ?? '' }}" @if($searchphrase == $val->source) selected @endif>
                                {{ $val->source ?? '' }}</option>
                        @endforeach
                        </select>
                        <button type="submit" id="searchbtn" class="btn btn-primary btn-sm mt-2">Search</button>
                        <a type="button" class="btn btn-primary btn-sm mt-2" href="{{ url('admin/commission') }}">Reset</a>

                    </form>
                </div>
            </div>
            <div class="table-responsive">

              @if(count($commissions))
              <table class="table">
                <thead>
                  <tr>
                    <th>S.No</th>
                    <th>Coin / Currency</th>
                    <th>Name</th>
                    <th>Withdraw %</th>
                    <th>Net Fee</th>
                    @if(in_array("read", explode(',',$AdminProfiledetails->commissionsetting)))
                    <th>Status</th>
                    @endif
                  </tr>
                </thead>
                <tbody>
                @foreach($commissions as $key => $commission)
                  <tr>
                    <td>{{ $key+1 }}</td>
                    <td>{{ $commission->source }}</td>
                    <td>{{ $commission->coinname }}</td>
                    <td>{{ $commission->withdraw }}</td>
                    <td>{{ number_format($commission->netfee, 8) }}</td>
                    @if(in_array("read", explode(',',$AdminProfiledetails->commissionsetting)))
                    <td><a href="{{ url('/admin/commissionsettings', Crypt::encrypt($commission->id)) }}" class="btn btn-info">View / Edit</a></td>
                    @endif
                  </tr>
                @endforeach
                </tbody>
              </table>
              {{ $commissions->links() }}
              @else
                {{ 'No Commissions Settings' }}
              @endif
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
@endsection
