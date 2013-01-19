class HomeController < ApplicationController
  def index
    redirect_to(schedule_url) unless session[:google_token].nil?
  end
end
