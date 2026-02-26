@php
$atitle ="cms";
@endphp
@extends('layouts.header')
@section('title', 'Users List - Admin')
@section('content')
<section class="content">
  <header class="content__title">
    <h1>FAQ</h1>    
  </header>
  @if ($message = Session::get('success'))
    <div class="alert alert-info">{{ $message }} </div><br />
  @endif
  @if ($message = Session::get('error'))
    <div class="alert alert-danger">{{ $message }} </div><br />
  @endif
  <div class="card">
    <div class="card-body">
      <div class="col-md-12 col-sm-12 col-xs-12 pl-0">
        <a href="{{ url('admin/faq_add') }}"  class="btn btn-danger"><i class="zmdi zmdi-plus zmdi-hc-fw"></i> Add FAQ</a> 
      </div>
      <div class="table-responsive search_result">
        <table class="table" id="dows">
          <thead>
            <tr>
              <th>S.No</th>
              <th>Header</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            @forelse($faq as $key => $faqs)
            <tr>
              <td>{{ $loop->iteration }}</td>
              <td>{{ $faqs->heading }}</td>
              <td>
                <a class="btn btn-success btn-xs" href="{{ url('admin/faq_edit/'.$faqs->id) }}"><i class="zmdi zmdi-edit"></i> View </a> 
                <a class="btn btn-info btn-xs" href="{{ url('admin/faq_delete/'.$faqs->id) }}"><i class="zmdi zmdi-delete zmdi-hc-fw"></i> Delete </a></td>
            </tr>
            @empty
            <tr><td colspan="3" class="text-center">No record found!</td></tr>
            @endforelse
          </tbody>
        </table>
      </div>
      <div class="col-md-12 col-sm-12 col-xs-12 nopadding">
        <div class="pagination-tt clearfix">
          @if($faq->count())
            {{ $faq->links() }}
          @endif
        </div>
      </div>
    </div>
  </div>
</div>
</div>
</section>
@endsection


