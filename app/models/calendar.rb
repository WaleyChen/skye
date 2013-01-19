class Calendar
  include Mongoid::Document

  field :email
  field :events

  belongs_to :user
end