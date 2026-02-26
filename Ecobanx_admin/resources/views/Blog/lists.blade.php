@php
$atitle ="bloglist";
@endphp
@extends('layouts.header')
@section('title', 'Coins Setting')
@section('content')
<section class="content">
  <div class="content__inner">
    <header class="content__title">
      <h1>Blog List</h1>
    </header>
    <div class="row">
      <div class="col-md-12">
        <div class="card">
          <div class="card-body">
          <h4 class="card-title">Blog List</h4>
            <div class="table-responsive">
              <a href="{{ url('/admin/add-blog') }}" class="btn btn-info">Add Blog</a>
              <br /><br />
              @if (session('status'))
                  <div class="alert alert-success" role="alert">
                      <button type="button" class="close" data-dismiss="alert" aria-label="Close"><span
                              aria-hidden="true">&times;</span></button><strong>Success!</strong>
                      {{ session('status') }}
                  </div>
              @endif
              @if (session('error'))
                  <div class="alert alert-success" role="alert">
                      <button type="button" class="close" data-dismiss="alert" aria-label="Close"><span
                              aria-hidden="true">&times;</span></button><strong>Error!</strong>
                      {{ session('error') }}
                  </div>
              @endif
              @if(count($datas))
              <table class="table">
                <thead>
                  <tr>
                    <th>S.No</th>
                    <th>Title</th>
                    <th>Slug</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody> 
                @foreach($datas as $key => $data)
                  <tr>
                    <td>{{ $key+1 }}</td>                 
                    <td>{{ $data->title ?? ''}}</td>
                    <td>
                      {{ $data->slug ?? '' }}
                    </td>
                    <td>
                      <a href="{{ route('editBlog',Crypt::encrypt($data->id)) }}" class="btn btn-info">View / Edit</a>
                    <a href="{{ route('deleteBlog',Crypt::encrypt($data->id)) }}" class="btn btn-info">Delete</a></td>
                    
                  </tr>
                @endforeach
                </tbody>
              </table>
              {{ $datas->links() }}
              @else
                {{ 'No List Settings' }}
              @endif
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
@endsection